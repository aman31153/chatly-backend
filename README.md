# Chatly FCM Notification Server

A production-ready Node.js + Express backend server using the Firebase Admin SDK to handle high-priority Firebase Cloud Messaging (FCM) chat notifications for the Chatly app.

## Requirements

* Node.js v18 or later
* Firebase Project service account JSON key

## Project Structure

```
notification-server/
├── firebase.js       # Firebase Admin initialization
├── server.js         # Express setup & notification route handler
├── package.json      # Dependencies and execution scripts
├── .env.example      # Sample environment variables config
└── README.md         # Deployment and usage instructions
```

## Setup & Local Run

1. Navigate to the notification server directory:
   ```bash
   cd notification-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Provide your Firebase Service Account JSON credentials:
   * **Option A (Recommended)**: Set the `FIREBASE_SERVICE_ACCOUNT_JSON` variable in your `.env` file containing the JSON string of your service account key file.
   * **Option B (Local-only)**: Rename your downloaded credentials file to `serviceAccountKey.json` and place it directly inside this `notification-server` folder.

5. Start the server in development mode:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---

## API Documentation

### Send Notification

* **Endpoint**: `POST /send-message`
* **Content-Type**: `application/json`

#### Request Body
```json
{
  "receiverUid": "receiver-user-uid",
  "senderUid": "sender-user-uid",
  "senderName": "Sender Nickname",
  "message": "Hey! How are you doing?",
  "chatId": "active-chat-session-id"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "sentCount": 1,
  "failedCount": 0,
  "cleanedTokensCount": 0
}
```

#### Error Response (`400 Bad Request` or `500 Internal Server Error`)
```json
{
  "error": "Missing required parameters..."
}
```

---

## Render Deployment

This server is designed to deploy seamlessly on [Render](https://render.com):

1. **Create a New Web Service** on Render and connect your repository.
2. Set the **Build Command** to:
   ```bash
   npm install
   ```
3. Set the **Start Command** to:
   ```bash
   npm start
   ```
4. Add the following **Environment Variables** in Render's dashboard:
   * `PORT`: `5000` (or leave empty to let Render bind standard ports)
   * `FIRESTORE_PROJECT_ID`: `anonymouschat-61ae0`
   * `FIREBASE_SERVICE_ACCOUNT_JSON`: `<Your complete Firebase Service Account JSON String>`
