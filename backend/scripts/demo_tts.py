import os
import sys
import time
import wave
import asyncio
import logging

# Add backend AND workspace root to path
backend_dir = os.path.join(os.path.dirname(__file__), "..")
workspace_root = os.path.join(backend_dir, "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(workspace_root))

from app.adapters.tts.kokoro_adapter import KokoroAdapter
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TTS_Demo")

TEST_TEXT = (
    "Hello! I am your new AI Voice Agent. "
    "I can synthesize speech in real time with incredibly low latency."
)

VOICES_TO_TEST = [
    "af_heart",   # Default female
    "af_bella",   # Another female
    "af_sarah",   # Another female
    "am_adam"     # Default male
]

async def test_voice(adapter: KokoroAdapter, voice: str):
    logger.info(f"\n{'='*40}\nTesting Voice: {voice}\n{'='*40}")
    
    # Override voice for this test
    adapter.voice = voice
    
    output_path = os.path.join(os.path.dirname(__file__), f"output_{voice}.wav")
    
    start_time = time.time()
    first_byte_time = None
    
    audio_data = bytearray()
    
    logger.info(f"Synthesizing text: '{TEST_TEXT}'")
    
    try:
        async for chunk in adapter.generate_audio_stream(TEST_TEXT):
            if first_byte_time is None:
                first_byte_time = time.time()
                ttfb = first_byte_time - start_time
                logger.info(f"⚡ [TTFB] Time to First Byte: {ttfb:.3f} seconds ⚡")
            
            audio_data.extend(chunk)
            
    except Exception as e:
        logger.error(f"Failed to synthesize voice {voice}: {e}")
        return
        
    end_time = time.time()
    total_time = end_time - start_time
    
    # Calculate audio duration
    # bytes / (sample_rate * channels * sample_width)
    # sample_rate = 24000, channels = 1, sample_width = 2 (16-bit)
    bytes_per_second = settings.TTS_SAMPLE_RATE * 1 * 2
    audio_duration = len(audio_data) / bytes_per_second
    
    # Real-Time Factor (RTF)
    rtf = total_time / audio_duration if audio_duration > 0 else 0
    
    logger.info(f"--- Metrics for {voice} ---")
    logger.info(f"Time to First Byte (TTFB): {ttfb:.3f} seconds")
    logger.info(f"Total Synthesis Time     : {total_time:.3f} seconds")
    logger.info(f"Total Audio Duration     : {audio_duration:.3f} seconds")
    logger.info(f"Real-Time Factor (RTF)   : {rtf:.3f} (Lower is better, < 1.0 means faster than real-time)")
    
    # Save to WAV file
    with wave.open(output_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(settings.TTS_SAMPLE_RATE)
        wf.writeframes(audio_data)
        
    logger.info(f"Saved audio to: {output_path}")


async def main():
    logger.info("=== Kokoro Local TTS Adapter Demo ===")
    
    try:
        # Load model eagerly once
        adapter = KokoroAdapter()
    except Exception as e:
        logger.error(f"Failed to initialize KokoroAdapter: {e}")
        return
        
    for voice in VOICES_TO_TEST:
        await test_voice(adapter, voice)

if __name__ == "__main__":
    asyncio.run(main())
