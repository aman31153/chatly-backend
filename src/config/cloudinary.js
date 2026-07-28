'use strict';

/**
 * cloudinary.js
 * -------------
 * Initialises the Cloudinary v2 SDK using environment variables and exports the
 * configured uploader so it can be used anywhere in the app.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME  – your Cloudinary cloud name
 *   CLOUDINARY_API_KEY     – your Cloudinary API key
 *   CLOUDINARY_API_SECRET  – your Cloudinary API secret
 */

const cloudinary = require('cloudinary').v2;

// Validate that all required env vars are set at startup — fail fast.
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    '[Cloudinary] Missing required environment variables: ' +
    'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. ' +
    'Please set them in your .env file or Render dashboard.'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  // Disable auto-signing in responses to reduce overhead
  secure: true,
});

module.exports = cloudinary;
