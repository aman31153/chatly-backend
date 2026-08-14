const admin = require('firebase-admin');
require('./src/config/env');


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
  
  const env = require('./src/config/env');
  const localKeyPath = env.isDevelopment ? './serviceAccountKey.dev.json' : './serviceAccountKey.json';
  
  console.warn(`Admin SDK will look for local ${localKeyPath}.`);
  try {
    serviceAccount = require(localKeyPath);
  } catch (err) {
    console.warn(`Local ${localKeyPath} not found. Admin SDK will try fallback authentication.`);
  }
}

const databaseURL =
  process.env.FIREBASE_DATABASE_URL ||
  'https://chatly-8d006-default-rtdb.asia-southeast1.firebasedatabase.app';

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIRESTORE_PROJECT_ID || serviceAccount.project_id,
      databaseURL: databaseURL,
    });
  } else {
    admin.initializeApp({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      databaseURL: databaseURL,
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
