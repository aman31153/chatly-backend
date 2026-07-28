"""
preload_model.py
----------------
Run during Render's BUILD phase (see render.yaml buildCommand).

Purpose:
  NudeNet downloads its ONNX model (~90 MB) from the internet on first use.
  By triggering that download here at build time, cold-start latency for the
  first user request is eliminated.

Usage:
  python python/preload_model.py
"""

import sys

print("[preload] Starting NudeNet model pre-download...")

try:
    from nudenet import NudeDetector

    # Instantiating NudeDetector triggers the model download if not cached.
    # The model (320n.onnx) is downloaded automatically by the package.
    detector = NudeDetector()

    # Run a dummy 1x1 white pixel image (base64 encoded JPEG)
    # to confirm the model loads end-to-end without errors.
    import tempfile
    import os
    from PIL import Image

    tmp_path = os.path.join(tempfile.gettempdir(), "preload_test.jpg")
    img = Image.new("RGB", (64, 64), color=(255, 255, 255))
    img.save(tmp_path, "JPEG")

    result = detector.detect(tmp_path)
    os.remove(tmp_path)

    print("[preload] NudeNet model loaded and verified successfully.")
    print(f"[preload] Test result: {result}")
    sys.exit(0)

except Exception as e:
    # Do NOT fail the build — if pre-download fails (network issue),
    # the model will be downloaded at first request instead.
    print(f"[preload] WARNING: Model pre-download failed: {e}", file=sys.stderr)
    print("[preload] Model will be downloaded on first request instead.")
    sys.exit(0)
