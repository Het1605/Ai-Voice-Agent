import os
import sys
import asyncio
import logging
import numpy as np

# Add backend to path
backend_dir = os.path.join(os.path.dirname(__file__), "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(os.path.join(backend_dir, "..")))

from app.api.websockets.transcoder import AudioTranscoder
from app.runtime.core.audio import AudioFrame

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TranscoderTest")

def main():
    logger.info("=== Testing AudioTranscoder with PyAV ===")
    
    transcoder = AudioTranscoder(target_sample_rate=16000)
    
    # 1. Simulate TTS generating an AudioFrame (e.g., 24kHz, 16-bit PCM)
    # We'll just generate a 1-second sine wave at 440Hz
    tts_sample_rate = 24000
    t = np.linspace(0, 1, tts_sample_rate, False)
    sine_wave = np.sin(440 * 2 * np.pi * t)
    pcm_audio = (sine_wave * 32767).astype(np.int16).tobytes()
    
    tts_frame = AudioFrame(
        pcm_data=pcm_audio,
        sample_rate=tts_sample_rate,
        channels=1,
        sample_width=2
    )
    logger.info(f"Generated fake TTS AudioFrame: {len(tts_frame.pcm_data)} bytes at {tts_frame.sample_rate}Hz")
    
    # 2. Test Downlink (Encoding to Twilio/WebRTC)
    target_codec = "pcm_mulaw"
    target_sr = 8000
    
    logger.info(f"Encoding to {target_codec} @ {target_sr}Hz...")
    encoded_bytes = transcoder.encode(
        frame=tts_frame,
        target_codec=target_codec,
        target_sample_rate=target_sr,
        target_channels=1
    )
    
    if not encoded_bytes:
        logger.error("Encoding failed!")
        return
        
    logger.info(f"Success! Encoded payload size: {len(encoded_bytes)} bytes")
    
    # 3. Test Uplink (Decoding from Twilio/WebRTC)
    logger.info(f"Decoding back from {target_codec} to internal AudioFrame...")
    decoded_frame = transcoder.decode(
        payload=encoded_bytes,
        source_codec=target_codec,
        source_sample_rate=target_sr,
        source_channels=1
    )
    
    if not decoded_frame:
        logger.error("Decoding failed!")
        return
        
    logger.info(f"Success! Decoded AudioFrame: {len(decoded_frame.pcm_data)} bytes at {decoded_frame.sample_rate}Hz")
    logger.info("=== AudioTranscoder is working perfectly! ===")

if __name__ == "__main__":
    main()
