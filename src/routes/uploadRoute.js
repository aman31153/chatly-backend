'use strict';

/**
 * uploadRoute.js
 * --------------
 * Express router: POST /api/upload-image
 *
 * Flow:
 *   1. Multer saves the multipart file to uploads/<uuid>.<ext> (max 5 MB, images only)
 *   2. moderationService.analyze() spawns detect.py and returns a {safe, score, label}
 *   3a. EXPLICIT  → delete temp file → 403 JSON response
 *   3b. SAFE      → upload to Cloudinary → delete temp file → 200 + URL
 *   ERR           → delete temp file (if it exists) → 500 JSON response
 *
 * Security measures:
 *   - File type whitelist (jpg / jpeg / png / webp) enforced BOTH by MIME type
 *     AND file extension (guards against spoofed Content-Type headers)
 *   - UUID-based filename → prevents path traversal attacks
 *   - Max file size: 5 MB (configurable via MAX_IMAGE_SIZE_MB env var)
 *   - Temp file deleted in a finally-equivalent pattern regardless of outcome
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

const cloudinary         = require('../config/cloudinary');
const moderationService  = require('../services/moderationService');

const router = express.Router();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Absolute path to the temporary uploads directory */
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/** Maximum allowed file size in bytes (default 5 MB) */
const MAX_SIZE_BYTES = (parseInt(process.env.MAX_IMAGE_SIZE_MB || '5', 10)) * 1024 * 1024;

/** Allowed MIME types */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

/** Allowed file extensions (lower-cased) */
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Ensure uploads directory exists (created once at module load time)
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Multer configuration
// ---------------------------------------------------------------------------

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // UUID filename prevents path traversal and avoids collisions under concurrent uploads
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

/**
 * File filter: rejects non-image MIME types early (before writing to disk).
 * Extension check is done again after saving as a belt-and-suspenders defence.
 * NOTE: In Multer v2, fileFilter errors are passed as plain Errors (not MulterError)
 */
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass a plain Error — Multer v2 will forward it to the route error handler
    cb(new Error(`INVALID_MIME:Unsupported file type "${file.mimetype}". Allowed: jpg, jpeg, png, webp.`));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: 1, // only one file per request
  },
});

// ---------------------------------------------------------------------------
// Helper: safely delete a temp file (never throws)
// ---------------------------------------------------------------------------
function safeDelete(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      // Log but do not crash — the file may have already been deleted
      console.warn(`[uploadRoute] Could not delete temp file "${filePath}": ${err.message}`);
    }
  });
}

// ---------------------------------------------------------------------------
// POST /api/upload-image
// ---------------------------------------------------------------------------
router.post('/upload-image', (req, res) => {
console.log('[uploadRoute] Received upload request');
  // Run Multer middleware manually so we can access req.file for cleanup
  upload.single('image')(req, res, async (multerErr) => {
    const tempFilePath = req.file ? req.file.path : null;

    // -------------------------------------------------------------------
    // Handle Multer-level errors (file too large, wrong type, etc.)
    // -------------------------------------------------------------------
    if (multerErr) {
      safeDelete(tempFilePath);

      // Multer v2 exposes MulterError for size/field limits
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File is too large. Maximum allowed size is ${process.env.MAX_IMAGE_SIZE_MB || 5} MB.`,
        });
      }

      // Our fileFilter prefixes the message with INVALID_MIME: for easy detection
      if (multerErr.message && multerErr.message.startsWith('INVALID_MIME:')) {
        return res.status(400).json({
          success: false,
          message: multerErr.message.replace('INVALID_MIME:', ''),
        });
      }

      // Unknown Multer / upload error
      console.error('[uploadRoute] Upload error:', multerErr);
      return res.status(500).json({ success: false, message: 'File upload failed.' });
    }

    // -------------------------------------------------------------------
    // Ensure a file was actually provided
    // -------------------------------------------------------------------
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Send a multipart/form-data request with field name "image".',
      });
    }

    // -------------------------------------------------------------------
    // Belt-and-suspenders extension check (guards against MIME spoofing)
    // -------------------------------------------------------------------
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
      safeDelete(tempFilePath);
      console.warn(`[uploadRoute] Rejected file with unsupported extension: ${fileExt}`);
      return res.status(400).json({
        success: false,
        message: `Unsupported file extension "${fileExt}". Allowed: .jpg, .jpeg, .png, .webp.`,
      });
    }

    // -------------------------------------------------------------------
    // Main flow: moderate → upload or reject
    // -------------------------------------------------------------------
    try {
      // Step 1: Run NudeNet via Python child process
      console.log(`[uploadRoute] Running moderation on: ${tempFilePath}`);
      const result = await moderationService.analyze(tempFilePath);

      console.log(
        `[uploadRoute] Moderation result — safe: ${result.safe}, ` +
        `score: ${result.score}, label: ${result.label}`
      );

      // Step 2a: Image violates guidelines → reject immediately
      if (!result.safe) {
        safeDelete(tempFilePath);
        return res.status(403).json({
          success: false,
          message: 'Image violates community guidelines.',
        });
      }

      // Step 2b: Image is safe → upload to Cloudinary
      console.log('[uploadRoute] Image is safe. Uploading to Cloudinary...');

      const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
        folder:          'chatly/chat-images',
        resource_type:   'image',
        // Overwrite disabled — each upload gets a unique public_id
        unique_filename: true,
        // Apply basic format optimisation (convert to WebP automatically)
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      // Step 3: Delete temp file after successful upload
      safeDelete(tempFilePath);

      console.log(`[uploadRoute] Cloudinary upload successful: ${cloudinaryResult.secure_url}`);

      return res.status(200).json({
        success:  true,
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      });

    } catch (err) {
      // Always clean up the temp file on any error
      safeDelete(tempFilePath);

      console.error('[uploadRoute] Error during moderation/upload:', err.message);

      // Distinguish timeout errors for a clearer user message
      if (err.message && err.message.includes('timed out')) {
        return res.status(503).json({
          success: false,
          message: 'Image moderation timed out. The server is under load — please try again.',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An internal error occurred while processing your image.',
      });
    }
  });
});

module.exports = router;
