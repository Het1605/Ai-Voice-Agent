import os
import urllib.request
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# The official Silero VAD v4 ONNX model URL (Version pinned for reproducibility)
MODEL_URL = "https://github.com/snakers4/silero-vad/raw/v4.0/files/silero_vad.onnx"
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "vad")
MODEL_PATH = os.path.join(MODEL_DIR, "silero_vad.onnx")

def download_model():
    """Downloads the Silero VAD ONNX model if it doesn't already exist."""
    if os.path.exists(MODEL_PATH):
        logger.info(f"Model already exists at {MODEL_PATH}")
        return

    logger.info(f"Creating directory {MODEL_DIR}")
    os.makedirs(MODEL_DIR, exist_ok=True)

    logger.info(f"Downloading Silero VAD model from {MODEL_URL}...")
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        logger.info(f"Successfully downloaded model to {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        raise e

if __name__ == "__main__":
    download_model()
