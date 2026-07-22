import os
import asyncio
import logging
from typing import AsyncGenerator

from app.runtime.ports import IAudioSynthesizer
from app.runtime.core.audio import AudioFrame
from app.core.config import settings

logger = logging.getLogger(__name__)

class KokoroAdapter(IAudioSynthesizer):
    """
    Local TTS Adapter using Kokoro ONNX.
    Eagerly loads the Kokoro ONNX model at startup and streams audio instantly.
    """
    def __init__(self, voice: str = None):
        self.voice = voice or settings.TTS_DEFAULT_VOICE
        self.sample_rate = settings.TTS_SAMPLE_RATE
        
        # Resolve model paths
        models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "tts")
        models_dir = os.path.abspath(models_dir)
        
        self.model_path = os.path.join(models_dir, settings.TTS_MODEL)
        self.voices_path = os.path.join(models_dir, settings.TTS_VOICES_FILE)
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.voices_path):
            raise FileNotFoundError(
                f"Kokoro model files not found in {models_dir}. "
                "Please run scripts/download_kokoro.py first!"
            )
            
        logger.info("Initializing Kokoro ONNX model (Eager Loading)...")
        
        try:
            from kokoro_onnx import Kokoro
            self.kokoro = Kokoro(self.model_path, self.voices_path)
            logger.info("Kokoro model loaded successfully!")
        except ImportError:
            raise ImportError(
                "Failed to import kokoro-onnx. "
                "Please ensure it is installed along with soundfile and misaki[en]."
            )
        except Exception as e:
            logger.error(f"Failed to load Kokoro ONNX model: {e}")
            raise
            
    async def generate_audio_stream(self, text: str) -> AsyncGenerator[AudioFrame, None]:
        """
        Synthesizes speech from text and yields AudioFrames.
        Runs synchronously inside a thread to avoid blocking the event loop.
        """
        if not text or not text.strip():
            return
            
        try:
            # kokoro.create_stream returns an async generator natively
            stream = self.kokoro.create_stream(
                text,
                voice=self.voice,
                speed=1.0,
                lang="en-us"
            )
            
            # Iterate through the returned audio chunks
            async for samples, sample_rate in stream:
                # Convert the numpy float32 array to 16-bit PCM bytes
                if samples is not None and len(samples) > 0:
                    # Kokoro-onnx returns float32 samples by default.
                    # Convert to 16-bit PCM
                    import numpy as np
                    pcm16 = (samples * 32767).astype(np.int16)
                    yield AudioFrame(
                        pcm_data=pcm16.tobytes(),
                        sample_rate=sample_rate,
                        channels=1,
                        sample_width=2
                    )
                    
        except Exception as e:
            logger.error(f"Error during TTS synthesis: {e}")
            raise
