'use strict';

/**
 * moderationService.js
 * --------------------
 * Spawns the Python NudeNet classifier as a child process and returns a
 * Promise that resolves with the detection result.
 *
 * Communication protocol:
 *   Node → Python (stdin) : absolute image file path + newline
 *   Python → Node (stdout): single JSON line  { safe, score, label }
 *
 * Environment variables consumed:
 *   NUDITY_THRESHOLD   (float 0–1, default 0.6) forwarded to detect.py
 *   PYTHON_BIN         path to python executable (default "python3")
 *   MODERATION_TIMEOUT milliseconds before we kill the Python process (default 30000)
 */

const { spawn }   = require('child_process');
const path        = require('path');

// Absolute path to detect.py — works regardless of the CWD
const DETECT_SCRIPT = path.resolve(__dirname, '../../python/detect.py');

// How many ms to wait for Python before timing out (Render Free is slow on cold start)
const TIMEOUT_MS = parseInt(process.env.MODERATION_TIMEOUT || '30000', 10);

// Which python binary to use (python3 on Linux/Render, python on Windows dev)
const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');

/**
 * Analyse an image file using NudeNet.
 *
 * @param {string} absoluteImagePath - Absolute path to the (already saved) temp image.
 * @returns {Promise<{safe: boolean, score: number, label: string}>}
 * @throws {Error} if detection fails or times out.
 */
function analyze(absoluteImagePath) {
  return new Promise((resolve, reject) => {
    let settled = false;  // guard against double-resolve / double-reject
    let stdoutData = '';
    let stderrData = '';
    let timeoutHandle;

    // Spawn python with NUDITY_THRESHOLD forwarded via the environment
    const pyProcess = spawn(PYTHON_BIN, [DETECT_SCRIPT], {
      env: {
        ...process.env,
        NUDITY_THRESHOLD: process.env.NUDITY_THRESHOLD || '0.6',
        // Tell detect.py which directories are allowed (matches where Multer saves files)
        UPLOADS_DIR: path.resolve(__dirname, '../../uploads'),
      },
      // Do NOT inherit stdio — we manage stdin/stdout ourselves
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // ---------------------------------------------------------------
    // Send the image path to Python via stdin
    // ---------------------------------------------------------------
    pyProcess.stdin.write(absoluteImagePath + '\n');
    pyProcess.stdin.end();

    // ---------------------------------------------------------------
    // Collect stdout (the JSON result)
    // ---------------------------------------------------------------
    pyProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString('utf8');
    });

    // ---------------------------------------------------------------
    // Collect stderr for logging (Python warnings, tracebacks, etc.)
    // ---------------------------------------------------------------
    pyProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString('utf8');
    });

    // ---------------------------------------------------------------
    // Timeout guard — kill the Python process if it takes too long
    // ---------------------------------------------------------------
    timeoutHandle = setTimeout(() => {
      if (!settled) {
        settled = true;
        pyProcess.kill('SIGKILL');
        reject(new Error(
          `[moderationService] NudeNet detection timed out after ${TIMEOUT_MS}ms. ` +
          'This may happen on the first request after a cold start. Please retry.'
        ));
      }
    }, TIMEOUT_MS);

    // ---------------------------------------------------------------
    // Handle process exit
    // ---------------------------------------------------------------
    pyProcess.on('close', (exitCode) => {
      clearTimeout(timeoutHandle);

      if (settled) return; // already timed out
      settled = true;

      // Log any stderr output (Python warnings / tracebacks)
      if (stderrData.trim()) {
        console.warn('[moderationService] Python stderr:', stderrData.trim());
      }

      // Parse the JSON line from stdout
      const rawJson = stdoutData.trim();
      if (!rawJson) {
        return reject(new Error(
          `[moderationService] Python process exited with code ${exitCode} and produced no output.`
        ));
      }

      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch (parseErr) {
        return reject(new Error(
          `[moderationService] Failed to parse NudeNet output as JSON. ` +
          `Raw output: "${rawJson.substring(0, 200)}"`
        ));
      }

      // Check for error reported by detect.py itself
      if (parsed.error) {
        return reject(new Error(`[moderationService] detect.py reported error: ${parsed.error}`));
      }

      if (typeof parsed.safe !== 'boolean') {
        return reject(new Error(
          `[moderationService] Unexpected JSON shape from detect.py: ${rawJson}`
        ));
      }

      resolve({
        safe:  parsed.safe,
        score: parsed.score,
        label: parsed.label,
      });
    });

    // ---------------------------------------------------------------
    // Handle spawn errors (e.g. python3 not found on PATH)
    // ---------------------------------------------------------------
    pyProcess.on('error', (err) => {
      clearTimeout(timeoutHandle);
      if (!settled) {
        settled = true;
        reject(new Error(
          `[moderationService] Failed to spawn Python process ("${PYTHON_BIN}"): ${err.message}. ` +
          'Make sure Python 3 is installed and on PATH.'
        ));
      }
    });
  });
}

module.exports = { analyze };
