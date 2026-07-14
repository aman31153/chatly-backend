const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { admin, db, messaging } = require('./firebase');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Send message notification endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { receiverUid, senderUid, senderName, message, chatId } = req.body;

    // Validate request body
    if (!receiverUid || !senderUid || !senderName || !message || !chatId) {
      return res.status(400).json({
        error: 'Missing required parameters. Required: receiverUid, senderUid, senderName, message, chatId'
      });
    }

    // Retrieve receiver's FCM tokens from Firestore
    const userDoc = await db.collection('users').doc(receiverUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: `Receiver user with UID ${receiverUid} not found` });
    }

    const userData = userDoc.data();
    const tokens = userData.fcmTokens || [];

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No FCM tokens registered for receiver. Notification skipped.'
      });
    }

    // Construct FCM Multicast payload
    // Construct FCM Multicast payload (data-only for custom actions handling)
    const payload = {
      data: {
        title: senderName,
        body: message,
        chatId: chatId,
        senderUid: senderUid,
        type: 'chat',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            badge: 1,
          }
        }
      },
      tokens: tokens
    };

    // Send multicast notifications
    const response = await messaging.sendEachForMulticast(payload);

    console.log(`Sent notification message response. successCount: ${response.successCount}, failureCount: ${response.failureCount}`);

    // Process failures to identify expired/invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resItem, index) => {
      if (!resItem.success) {
        const error = resItem.error;
        console.error(`FCM token index ${index} failed with error:`, error.message);
        if (
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      try {
        await db.collection('users').doc(receiverUid).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens)
        });
        console.log(`Successfully cleaned up ${invalidTokens.length} stale FCM tokens for user ${receiverUid}`);
      } catch (dbErr) {
        console.error('Failed to clean up stale tokens from Firestore:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount,
      cleanedTokensCount: invalidTokens.length
    });

  } catch (error) {
    console.error('Error handling send-message notification:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Send call notification endpoint
app.post('/send-call-notification', async (req, res) => {
  try {
    const { receiverUid, callId, callType, callerName, chatId } = req.body;

    if (!receiverUid || !callId || !callType || !callerName || !chatId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const userDoc = await db.collection('users').doc(receiverUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: `Receiver user not found` });
    }

    const tokens = userDoc.data().fcmTokens || [];
    if (tokens.length === 0) {
      return res.status(200).json({ success: true, message: 'No FCM tokens.' });
    }

    const callTitle = callerName;
    const callBody = callType === 'video' ? '📹 Incoming video call...' : '📞 Incoming audio call...';

    // High-priority call notification with full-screen intent for lock-screen display
    const payload = {
      data: {
        title: callTitle,
        body: callBody,
        chatId: chatId,
        callId: callId,
        callType: callType,
        callerName: callerName,
        type: 'call',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'call_channel',
          sound: 'default',
          title: callTitle,
          body: callBody,
          defaultVibrateTimings: true,
        },
        ttl: 3600 * 1000, // Expire after 30 seconds if not delivered
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            alert: { title: callTitle, body: callBody },
            badge: 1,
          }
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'voip',
        }
      },
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`Call notification sent. successCount: ${response.successCount}, failureCount: ${response.failureCount}`);

    // Clean up invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resItem, index) => {
      if (!resItem.success) {
        const err = resItem.error;
        console.error(`Call FCM token index ${index} failed:`, err.message);
        if (
          err.code === 'messaging/invalid-registration-token' ||
          err.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await db.collection('users').doc(receiverUid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens)
      }).catch(e => console.error('Token cleanup error:', e.message));
    }

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    });
  } catch (error) {
    console.error('Error handling call notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Send missed call notification endpoint
app.post('/send-missed-call-notification', async (req, res) => {
  try {
    const { receiverUid, callId, callerName, chatId } = req.body;

    if (!receiverUid || !callId || !callerName || !chatId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const userDoc = await db.collection('users').doc(receiverUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: `Receiver user not found` });
    }

    const tokens = userDoc.data().fcmTokens || [];
    if (tokens.length === 0) {
      return res.status(200).json({ success: true, message: 'No FCM tokens.' });
    }

    const payload = {
      data: {
        title: `Missed call from ${callerName}`,
        body: 'Tap to call back',
        chatId: chatId,
        callId: callId,
        callerName: callerName,
        type: 'missed_call',
      },
      android: {
        priority: 'high',
      },
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`Missed call notification sent. successCount: ${response.successCount}`);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
    });
  } catch (error) {
    console.error('Error handling missed call notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Agora Token Endpoint
app.get('/agora-token', (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(400).json({ error: 'channelName is required' });
  }

  // Use integer uid if provided, otherwise default to 0
  let uid = req.query.uid;
  if (!uid || uid === '') {
    uid = 0;
  }
  
  // Get role (publisher or subscriber)
  let role = RtcRole.PUBLISHER;
  if (req.query.role === 'subscriber') {
    role = RtcRole.SUBSCRIBER;
  }

  const expireTime = req.query.expiry ? parseInt(req.query.expiry, 10) : 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return res.status(500).json({ error: 'Agora App ID or Certificate not configured on server' });
  }

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expireTime,
      privilegeExpireTime
    );
    return res.json({ token });
  } catch (err) {
    console.error('Error generating Agora token:', err);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chatly Notification Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Local network access: http://192.168.29.155:${PORT}`);
});
