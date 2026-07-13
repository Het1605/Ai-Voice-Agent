import os
import sys
import time
import wave
import asyncio
import logging

# Add backend AND the workspace root to path so we can import both 'app.' and 'backend.app.' modules
backend_dir = os.path.join(os.path.dirname(__file__), "..")
workspace_root = os.path.join(backend_dir, "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(workspace_root))

from app.infrastructure.ai.faster_whisper import FasterWhisperAdapter

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("STT_Demo")

def read_wav_file(filepath: str) -> bytes:
    """Reads a wav file and extracts raw PCM bytes. Checks format."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Audio file not found: {filepath}")
        
    with wave.open(filepath, 'rb') as wf:
        if wf.getframerate() != 16000:
            logger.warning(f"File {filepath} has sample rate {wf.getframerate()}, but adapter expects 16000. Transcription may be degraded.")
        if wf.getsampwidth() != 2:
            logger.warning(f"File {filepath} has sample width {wf.getsampwidth()} bytes, adapter expects 2 (16-bit).")
        if wf.getnchannels() != 1:
            logger.warning(f"File {filepath} has {wf.getnchannels()} channels, adapter expects 1 (mono).")
            
        return wf.readframes(wf.getnframes())

async def main():
    logger.info("=== Faster-Whisper Adapter Demo ===")
    
    adapter = FasterWhisperAdapter()
    
    # 1. Load Model
    logger.info(f"Loading Whisper model (size: {adapter.model_size})...")
    start_time = time.time()
    try:
        await adapter.start_stream()
    except Exception as e:
        logger.error(f"Initialization failed: {e}")
        return
    load_time = time.time() - start_time
    logger.info(f"Model loaded in {load_time:.2f} seconds.")
    
    # 2. Setup audio test files
    # By default, try to find a sample file in the scripts directory
    sample_dir = os.path.dirname(__file__)
    test_files = [os.path.join(sample_dir, "sample.wav")]
    
    # If the user provided arguments, use those instead
    if len(sys.argv) > 1:
        test_files = sys.argv[1:]
        
    for filepath in test_files:
        logger.info(f"\n--- Testing file: {os.path.basename(filepath)} ---")
        try:
            # Read bytes
            audio_bytes = read_wav_file(filepath)
            duration_sec = len(audio_bytes) / (16000 * 2) # 16kHz * 2 bytes per sample
            logger.info(f"Loaded {len(audio_bytes)} bytes of audio ({duration_sec:.2f} seconds of speech).")
            
            # Transcribe
            logger.info("Starting transcription...")
            t0 = time.time()
            result = await adapter.process_audio(audio_bytes)
            latency = time.time() - t0
            
            # Print results
            logger.info(f"Transcription Latency: {latency:.2f} seconds")
            logger.info(f"Real-Time Factor (RTF): {latency / duration_sec:.3f}x")
            logger.info(f"Detected Language: {result.language}")
            logger.info(f"Transcript: '{result.text}'")
            
        except FileNotFoundError as e:
            logger.error(e)
            logger.info("Tip: Create a 16kHz mono WAV file named 'sample.wav' in the scripts/ folder or pass a file path as an argument.")
        except Exception as e:
            logger.error(f"Error processing file {filepath}: {e}")

    await adapter.close_stream()

if __name__ == "__main__":
    asyncio.run(main())
