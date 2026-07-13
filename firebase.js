const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env var:', error.message);
    process.exit(1);
  }
} else {
  console.warn('WARNING: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not defined.');
  console.warn('Admin SDK will attempt to use default credentials or look for local serviceAccountKey.json.');
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.warn('Local serviceAccountKey.json not found. Admin SDK will try fallback authentication.');
  }
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIRESTORE_PROJECT_ID || serviceAccount.project_id
    });
  } else {
    admin.initializeApp({
      projectId: process.env.FIRESTORE_PROJECT_ID
    });
  }
  console.log('Firebase Admin SDK initialized successfully.');
} catch (e) {
  console.error('Firebase Admin SDK initialization failed:', e.message);
  process.exit(1);
}

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = { admin, db, messaging };
