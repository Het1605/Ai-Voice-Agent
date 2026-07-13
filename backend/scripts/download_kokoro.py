import os
import urllib.request
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Official Kokoro v1.0 ONNX model files from GitHub Releases
KOKORO_BASE_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
FILES_TO_DOWNLOAD = [
    "kokoro-v1.0.onnx",
    "voices-v1.0.bin"
]

def download_file(url: str, dest_path: str):
    if os.path.exists(dest_path):
        logger.info(f"File already exists: {dest_path}")
        return
        
    logger.info(f"Downloading {url} to {dest_path}...")
    try:
        urllib.request.urlretrieve(url, dest_path)
        logger.info(f"Successfully downloaded {os.path.basename(dest_path)}")
    except Exception as e:
        logger.error(f"Failed to download {url}: {e}")
        raise e

def download_kokoro():
    """
    Downloads the official Kokoro v1.0 ONNX model and the bundled voice profiles.
    """
    target_dir = os.path.join(os.path.dirname(__file__), "..", "models", "tts")
    os.makedirs(target_dir, exist_ok=True)
    target_dir = os.path.abspath(target_dir)
    
    logger.info(f"Setting up Kokoro TTS models in {target_dir}")
    
    for filename in FILES_TO_DOWNLOAD:
        url = f"{KOKORO_BASE_URL}/{filename}"
        dest_path = os.path.join(target_dir, filename)
        download_file(url, dest_path)
        
    logger.info("Kokoro model download complete! Make sure you have 'espeak-ng' installed on your system.")
    logger.info("On Mac, you can install it via: brew install espeak-ng")

if __name__ == "__main__":
    download_kokoro()
