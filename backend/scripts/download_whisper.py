import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_model():
    """
    Pre-downloads the Faster-Whisper model into the local models directory.
    This prevents the STT adapter from blocking the application on startup.
    """
    try:
        from faster_whisper import download_model
    except ImportError:
        logger.error("faster-whisper is not installed. Please install it first.")
        return

    # Use the base model as our default for the prototype
    model_size = "base"
    
    # Target directory for STT models
    target_dir = os.path.join(os.path.dirname(__file__), "..", "models", "stt")
    os.makedirs(target_dir, exist_ok=True)
    target_dir = os.path.abspath(target_dir)
    
    logger.info(f"Downloading Whisper '{model_size}' model to {target_dir}...")
    
    try:
        # download_model will automatically download from HuggingFace
        # and store it in the specified directory.
        downloaded_path = download_model(model_size, output_dir=target_dir)
        logger.info(f"Successfully downloaded Whisper model to: {downloaded_path}")
    except Exception as e:
        logger.error(f"Failed to download Whisper model: {e}")
        raise e

if __name__ == "__main__":
    download_model()
