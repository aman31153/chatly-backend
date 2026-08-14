const express = require('express');
const cors = require('cors');
require('./src/config/env');

// Disable console outputs in production
if (process.env.NODE_ENV === 'production') {
  console.log = function() {};
  console.info = function() {};
  console.warn = function() {};
  console.error = function() {};
}

const { admin, db, messaging } = require('./firebase');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const uploadRoute = require('./src/routes/uploadRoute');


const app = express();
app.use(cors());
app.use(express.json());

// Image upload route (Multer + NudeNet moderation + Cloudinary)
app.use('/api', uploadRoute);

const PORT = process.env.PORT || 5000;
const https = require('https');

const fs = require('fs');
const path = require('path');

// Get stickers configuration endpoint
app.get('/api/stickers', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'stickers_config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'Stickers configuration not found' });
    }
    const data = fs.readFileSync(configPath, 'utf8');
    const json = JSON.parse(data);
    res.status(200).json(json);
  } catch (error) {
    console.error('Error reading stickers config:', error.message);
    res.status(500).json({ error: 'Failed to read stickers configuration' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Send message notification endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { receiverUid, senderUid, senderName, senderAvatar, message, chatId, senderSeq, messageId, giftType } = req.body;
    console.log(`[send-message] Request received for chatId: ${chatId}, giftType: ${giftType}`);

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
    const payload = {
      data: {
        title: senderName,
        body: message,
        chatId: chatId,
        senderUid: senderUid,
        receiverUid: receiverUid,
        senderSeq: senderSeq ? senderSeq.toString() : '',
        messageId: messageId ? messageId.toString() : '',
        callerAvatar: senderAvatar || '',
        type: 'chat',
        giftType: giftType || '',
      },
      android: {
        priority: 'high'
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

    console.log(`[send-message] Sending FCM payload with giftType: ${payload.data.giftType}`);

    // Send multicast notifications
    const response = await messaging.sendEachForMulticast(payload);

    console.log(`Sent notification message response. successCount: ${response.successCount}, failureCount: ${response.failureCount}. Message: ${message}`);

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
    const { receiverUid, callId, callType, callerName, callerAvatar, chatId } = req.body;

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

    // High-priority call notification (data-only for Android to allow flutter_callkit_incoming to handle it)
    const payload = {
      data: {
        title: callTitle,
        body: callBody,
        chatId: chatId,
        callId: callId,
        callType: callType,
        callerName: callerName,
        callerAvatar: callerAvatar || '',
        type: 'call',
      },
      android: {
        priority: 'high',
        ttl: 3600 * 1000,
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
    const { receiverUid, callId, callerName, chatId, senderUid, senderSeq } = req.body;

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
        senderUid: senderUid || '',
        senderSeq: senderSeq ? senderSeq.toString() : '',
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

// Dismiss a delivered chat notification on the receiver's device.
// Called when the sender deletes a message so User B's system tray notification
// is automatically cancelled. Only targets receiverUid — other users are unaffected.
app.post('/dismiss-notification', async (req, res) => {
  try {
    const { receiverUid, chatId } = req.body;

    if (!receiverUid || !chatId) {
      return res.status(400).json({
        error: 'Missing required parameters. Required: receiverUid, chatId'
      });
    }

    const userDoc = await db.collection('users').doc(receiverUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: `Receiver user with UID ${receiverUid} not found` });
    }

    const tokens = userDoc.data().fcmTokens || [];
    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No FCM tokens registered for receiver. Dismiss skipped.'
      });
    }

    // Data-only (silent) payload — no notification key so no banner is shown.
    // The Flutter handler reads type='dismiss_chat_notification' and cancels
    // localNotifications.cancel(chatId.hashCode) on the receiver's device.
    const payload = {
      data: {
        type: 'dismiss_chat_notification',
        chatId: chatId,
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          }
        },
        headers: {
          'apns-priority': '5',
          'apns-push-type': 'background',
        }
      },
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`Dismiss notification sent to ${receiverUid} for chatId ${chatId}. successCount: ${response.successCount}, failureCount: ${response.failureCount}`);

    // Clean up invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resItem, index) => {
      if (!resItem.success) {
        const err = resItem.error;
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
    console.error('Error handling dismiss-notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Send call ended notification endpoint
app.post('/send-call-ended', async (req, res) => {
  try {
    const { receiverUid, callId, chatId, senderUid, senderSeq } = req.body;

    if (!receiverUid || !callId || !chatId) {
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

    // Data-only payload so the flutter background handler can dismiss callkit
    const payload = {
      data: {
        chatId: chatId,
        callId: callId,
        type: 'call_ended',
        senderUid: senderUid || '',
        senderSeq: senderSeq ? senderSeq.toString() : '',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          }
        },
        headers: {
          'apns-priority': '5',
          'apns-push-type': 'background',
        }
      },
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`Call ended notification sent. successCount: ${response.successCount}`);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
    });
  } catch (error) {
    console.error('Error handling call ended notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Decline call endpoint to clean up RTDB via Admin SDK
app.post('/decline-call', async (req, res) => {
  try {
    console.log('Received decline call request:', req.body);
    const { callId } = req.body;
    if (!callId) {
      return res.status(400).json({ error: 'Missing required callId parameter.' });
    }

    const rtdb = admin.database();
    const callRef = rtdb.ref(`calls/${callId}`);
    const snap = await callRef.get();

    if (snap.exists()) {
      const data = snap.val();
      const receiverId = data ? data.receiverId : null;
      await callRef.remove();
      if (receiverId) {
        await rtdb.ref(`incomingCalls/${receiverId}/${callId}`).remove();
      }
      console.log(`Call ${callId} successfully declined and removed via Admin SDK`);
    } else {
      console.log(`Call ${callId} node already removed or not found in RTDB`);
    }

    return res.status(200).json({ success: true, callId });
  } catch (error) {
    console.error('Error in /decline-call endpoint:', error);
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

// Endpoint to handle secure user reporting and automatic temporary bans
app.post('/report-user', async (req, res) => {
  try {
    const { reporterUid, reportedUid, reason } = req.body;

    if (!reporterUid || !reportedUid || !reason) {
      return res.status(400).json({ error: 'Missing required parameters. Required: reporterUid, reportedUid, reason' });
    }

    // Check if they have exchanged at least 5 messages
    const chatsSnap = await db.collection('chats')
      .where('participants', 'array-contains', reporterUid)
      .get();

    const sharedChat = chatsSnap.docs.find(doc => {
      const parts = doc.data().participants || [];
      return parts.includes(reportedUid);
    });

    if (!sharedChat) {
      console.log(`Report skipped: No chat found between ${reporterUid} and ${reportedUid}`);
      return res.json({ success: true, message: 'Report received but skipped due to lack of interaction.' });
    }

    const messagesQuery = await db.collection('chats').doc(sharedChat.id).collection('messages').count().get();
    const messageCount = messagesQuery.data().count;

    if (messageCount < 5) {
      console.log(`Report skipped: Only ${messageCount} messages exchanged between ${reporterUid} and ${reportedUid}`);
      return res.json({ success: true, message: 'Report received but skipped due to insufficient messages.' });
    }

    const reportId = `${reporterUid}_${reportedUid}`;

    // Write/Update the report document to prevent duplicate reports from the same user
    await db.collection('reports').doc(reportId).set({
      reporterId: reporterUid,
      reportedId: reportedUid,
      reason: reason,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Load moderation settings from system config document
    let banThreshold = 3;
    let banDurationHours = 6;

    try {
      const configDoc = await db.collection('system').doc('moderation').get();
      if (configDoc.exists) {
        const configData = configDoc.data();
        if (configData.banThreshold !== undefined) {
          banThreshold = configData.banThreshold;
        }
        if (configData.banDurationHours !== undefined) {
          banDurationHours = configData.banDurationHours;
        }
      }
    } catch (configErr) {
      console.warn('Could not load moderation configuration, using defaults:', configErr.message);
    }

    // Count how many reports this user has using count() aggregation
    const reportsCountQuery = await db.collection('reports')
      .where('reportedId', '==', reportedUid)
      .count()
      .get();

    const reportCount = reportsCountQuery.data().count;
    console.log(`User ${reportedUid} has ${reportCount} reports (Threshold: ${banThreshold}).`);

    if (reportCount >= banThreshold) {
      // Check if already banned to avoid duplicate bans/notifications
      const userDoc = await db.collection('users').doc(reportedUid).get();
      let alreadyBanned = false;
      let tokens = [];

      if (userDoc.exists) {
        const userData = userDoc.data();
        tokens = userData.fcmTokens || [];
        const currentBannedUntil = userData.bannedUntil;
        const now = admin.firestore.Timestamp.now();

        if (currentBannedUntil && currentBannedUntil.toMillis() > now.toMillis()) {
          alreadyBanned = true;
          console.log(`User ${reportedUid} is already banned. Skipping.`);
        }
      }

      if (!alreadyBanned) {
        const banExpiry = new Date();
        banExpiry.setHours(banExpiry.getHours() + banDurationHours);

        console.log(`Banning user ${reportedUid} until ${banExpiry}`);

        // Update user doc with suspension status and hasUnreadNotifications flag
        await db.collection('users').doc(reportedUid).update({
          'isSuspended': true,
          'bannedUntil': admin.firestore.Timestamp.fromDate(banExpiry),
          'banReason': 'Temporarily suspended due to multiple reports.',
          'hasUnreadNotifications': true,
          'unreadNotificationsCount': admin.firestore.FieldValue.increment(1)
        });

        // Write in-app notification
        await db.collection('users').doc(reportedUid).collection('notifications').add({
          'title': 'Account Suspended',
          'body': `Your account has been temporarily suspended for ${banDurationHours} hours due to multiple reports.`,
          'type': 'ban',
          'createdAt': admin.firestore.FieldValue.serverTimestamp(),
          'seen': false
        });

        // Prune notifications to keep only the latest 5 documents
        try {
          const notifsSnap = await db.collection('users')
            .doc(reportedUid)
            .collection('notifications')
            .orderBy('createdAt', 'desc')
            .get();
          if (notifsSnap.size > 5) {
            const pruneBatch = db.batch();
            for (let i = 5; i < notifsSnap.size; i++) {
              pruneBatch.delete(notifsSnap.docs[i].ref);
            }
            await pruneBatch.commit();
          }
        } catch (pruneErr) {
          console.error('Error pruning notifications: ', pruneErr.message);
        }

        // Send push notification to notify the banned user immediately
        if (tokens.length > 0) {
          const payload = {
            data: {
              title: 'Account Suspended',
              body: `Your account has been temporarily suspended for ${banDurationHours} hours due to multiple reports.`,
              type: 'ban'
            },
            android: {
              priority: 'high'
            },
            tokens: tokens
          };
          await messaging.sendEachForMulticast(payload).catch(err => {
            console.error('Error sending ban notification: ', err.message);
          });
        }
      }
    }

    return res.status(200).json({ success: true, reportCount });

  } catch (error) {
    console.error('Error handling report-user:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Send game accepted notification endpoint
app.post('/send-game-accepted', async (req, res) => {
  try {
    const { receiverUid, chatId, gameId, gameType, senderName } = req.body;

    if (!receiverUid || !chatId || !gameId || !senderName) {
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
        title: 'Game Accepted',
        body: `${senderName} accepted your game invite`,
        chatId: chatId,
        gameId: gameId,
        gameType: gameType || '',
        type: 'game_accepted',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            alert: { title: 'Game Accepted', body: `${senderName} accepted your game invite` },
            badge: 1,
          }
        },
      },
      tokens: tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`Game accepted notification sent. successCount: ${response.successCount}`);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
    });
  } catch (error) {
    console.error('Error handling game accepted notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chatly Notification Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Local network access: http://192.168.29.155:${PORT}`);
});
