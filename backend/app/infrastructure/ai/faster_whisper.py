import os
import asyncio
import logging
import numpy as np

from backend.app.voice_engine.ports import IAudioTranscriber, TranscriptionResult
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class FasterWhisperAdapter(IAudioTranscriber):
    """
    Local Speech-to-Text using Faster-Whisper.
    Uses 'Endpoint pseudo-streaming' - expects a full utterance chunk (e.g. from VAD).
    Offloads inference to a separate thread to prevent blocking the async event loop.
    """
    
    def __init__(self):
        self.model_size = settings.STT_MODEL_SIZE
        self.compute_type = settings.STT_COMPUTE_TYPE
        
        # Resolve Model Path
        current_dir = os.path.dirname(__file__)
        self.model_dir = os.path.join(current_dir, "..", "..", "..", "models", "stt", f"models--Systran--faster-whisper-{self.model_size}")
        
        # Note: faster-whisper's download_model creates a folder like 'models--Systran--faster-whisper-base'
        # To be safe and let faster-whisper handle the path resolution natively, we will point it to the base models/stt dir 
        # and it will find the downloaded model there, or we can just pass the path. 
        # Actually, if we pass the download_dir to WhisperModel, it will look for it.
        self.download_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "models", "stt"))
        
        self.model = None

    async def start_stream(self) -> None:
        """Initializes the Faster-Whisper model in a background thread."""
        logger.info(f"Initializing FasterWhisperAdapter (Model: {self.model_size}, Compute: {self.compute_type})")
        
        try:
            # We run initialization in a thread because loading the model can block
            await asyncio.to_thread(self._load_model)
            logger.info("FasterWhisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load FasterWhisper model: {e}")
            raise RuntimeError(f"FasterWhisper model failed to load. Please run scripts/download_whisper.py. Error: {e}")

    def _load_model(self):
        from faster_whisper import WhisperModel
        
        # Check if the model directory has any downloaded models
        if not os.path.exists(self.download_dir) or not os.listdir(self.download_dir):
            raise FileNotFoundError(f"No Whisper models found in {self.download_dir}")
            
        # Initialize the model using the local directory path directly
        # When local_files_only=True, passing the absolute path to the directory containing model.bin is the safest method.
        self.model = WhisperModel(
            self.download_dir, 
            device="cpu", 
            compute_type=self.compute_type,
            local_files_only=True # STRICTLY prevent automatic downloads at runtime
        )

    def _transcribe_sync(self, audio_float32: np.ndarray) -> TranscriptionResult:
        """Synchronous wrapper for transcription."""
        if not self.model:
            raise RuntimeError("FasterWhisper model is not loaded. Call start_stream() first.")
            
        # Transcribe the audio
        segments, info = self.model.transcribe(audio_float32, beam_size=5)
        
        # Combine segments into a single string
        text = " ".join([segment.text for segment in segments]).strip()
        
        return TranscriptionResult(
            text=text,
            confidence=None, # Faster-Whisper segments have avg_logprob, but we'll leave None for now
            language=info.language,
            metadata={
                "language_probability": info.language_probability,
                "duration": info.duration,
            }
        )

    async def process_audio(self, audio_chunk: bytes) -> TranscriptionResult:
        """
        Receives a complete spoken utterance as raw 16kHz PCM bytes.
        Runs inference in a thread and returns the TranscriptionResult.
        """
        if not audio_chunk:
            return TranscriptionResult(text="", confidence=0.0)
            
        # 1. Convert bytes (int16) to float32 numpy array
        # Assuming 16kHz 16-bit Mono PCM
        audio_int16 = np.frombuffer(audio_chunk, dtype=np.int16)
        audio_float32 = audio_int16.astype(np.float32) / 32768.0
        
        # 2. Run inference in a background thread
        logger.debug("Transcribing audio chunk in background thread...")
        result = await asyncio.to_thread(self._transcribe_sync, audio_float32)
        logger.debug(f"Transcription complete: '{result.text}'")
        
        return result

    async def close_stream(self) -> None:
        """Cleans up the STT resources."""
        self.model = None
        logger.info("FasterWhisperAdapter stream closed.")
