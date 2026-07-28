"""
detect.py
---------
NudeNet adult-content detection script.

Protocol (Node.js ↔ Python):
  INPUT  (stdin)  : absolute path to the image file (UTF-8, one line)
  OUTPUT (stdout) : single JSON line with detection result
  EXIT CODE       : 0 = success (safe OR explicit), 1 = error

JSON output schema:
  {
    "safe"   : bool,   // true = image is safe to upload
    "score"  : float,  // highest explicit-content confidence score (0.0–1.0)
    "label"  : str     // top label name (e.g. "SAFE", "FEMALE_BREAST_EXPOSED")
  }

The threshold is controlled by the NUDITY_THRESHOLD env var
(set from Node.js before spawning this process, default 0.6).
"""

import sys
import os
import json

# Define which labels from NudeNet v3 are considered explicit
EXPLICIT_LABELS = {
    "BUTTOCKS_EXPOSED",
    "FEMALE_BREAST_EXPOSED",
    "FEMALE_GENITALIA_EXPOSED",
    "ANUS_EXPOSED",
    "MALE_GENITALIA_EXPOSED",
}

def main():
    # -----------------------------------------------------------------
    # 1. Read file path from stdin
    # -----------------------------------------------------------------
    raw = sys.stdin.readline().strip()
    if not raw:
        _fail("No image path received on stdin.")

    image_path = raw

    # -----------------------------------------------------------------
    # 2. Basic path validation (prevent path traversal)
    # -----------------------------------------------------------------
    image_path = os.path.realpath(image_path)

    # Ensure the file exists and is actually a file (not a symlink to /etc/passwd etc.)
    if not os.path.isfile(image_path):
        _fail(f"File not found or not a regular file: {image_path}")

    # Only allow files inside the OS temp directory or the project uploads/ directory.
    # We accept any /tmp or uploads/ location — adjust if needed.
    allowed_prefixes = (
        os.path.realpath(os.environ.get("UPLOADS_DIR", "/tmp")),
        "/tmp",
        os.path.expanduser("~"),  # for local dev on Windows/Mac
    )
    if not any(image_path.startswith(p) for p in allowed_prefixes):
        _fail(f"Path '{image_path}' is outside the allowed upload directory.")

    # -----------------------------------------------------------------
    # 3. Load threshold from env (set by Node.js moderationService.js)
    # -----------------------------------------------------------------
    try:
        threshold = float(os.environ.get("NUDITY_THRESHOLD", "0.6"))
        if not (0.0 < threshold <= 1.0):
            raise ValueError
    except ValueError:
        threshold = 0.6

    # -----------------------------------------------------------------
    # 4. Run NudeNet NudeDetector
    # -----------------------------------------------------------------
    try:
        from nudenet import NudeDetector
        detector = NudeDetector()
    except Exception as e:
        _fail(f"Failed to load NudeDetector: {e}")

    try:
        # detect() returns a list of dictionaries:
        # [{"class": "FEMALE_BREAST_EXPOSED", "score": 0.85, "box": [x, y, w, h]}, ...]
        detections = detector.detect(image_path)
    except Exception as e:
        _fail(f"NudeNet detection failed: {e}")

    # -----------------------------------------------------------------
    # 5. Parse result
    # -----------------------------------------------------------------
    max_explicit_score = 0.0
    top_label = "SAFE"
    
    for det in detections:
        det_class = det.get("class", "")
        det_score = float(det.get("score", 0.0))
        
        # If the detected item is in our explicit list and has a higher score
        if det_class in EXPLICIT_LABELS:
            if det_score > max_explicit_score:
                max_explicit_score = det_score
                top_label = det_class

    is_safe = max_explicit_score < threshold

    result = {
        "safe":  is_safe,
        "score": round(max_explicit_score, 4),
        "label": top_label if not is_safe else "SAFE",
    }

    # Write JSON to stdout (Node.js reads this line)
    print(json.dumps(result), flush=True)
    sys.exit(0)


def _fail(message: str):
    """Write error JSON to stdout and exit with code 1."""
    error_result = {
        "error": message,
        "safe":  None,
        "score": None,
        "label": None,
    }
    print(json.dumps(error_result), flush=True)
    sys.exit(1)


if __name__ == "__main__":
    main()
