import os
import logging
import numpy as np
import onnxruntime as ort

from app.runtime.ports import IVoiceActivityDetector, VadState
from app.runtime.core.audio import AudioFrame
from app.core.config import settings

logger = logging.getLogger(__name__)

class SileroVadAdapter(IVoiceActivityDetector):
    """
    Local Voice Activity Detection using Silero VAD (ONNX).
    Assumes incoming audio is 16kHz, 16-bit, Mono PCM.
    """
    
    def __init__(self):
        # 1. Resolve Model Path
        current_dir = os.path.dirname(__file__)
        self.model_path = os.path.join(current_dir, "..", "..", "..", "models", "vad", "silero_vad.onnx")
        self.model_path = os.path.abspath(self.model_path)
        
        # 2. Check if model exists
        if not os.path.exists(self.model_path):
            error_msg = f"Silero VAD model not found at {self.model_path}. Please run scripts/download_silero.py"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
        # 3. Load ONNX Session
        logger.info(f"Loading Silero VAD model from {self.model_path}")
        self.session = ort.InferenceSession(self.model_path)
        
        # 4. Configuration
        self.threshold = settings.VAD_THRESHOLD
        self.sample_rate = settings.VAD_SAMPLE_RATE
        self.frame_size = settings.VAD_FRAME_SIZE
        
        # Audio is 16-bit PCM, so 1 sample = 2 bytes
        self.bytes_per_frame = self.frame_size * 2
        
        # Internal state buffer for incomplete frames
        self._audio_buffer = bytearray()
        
        # Silero state tensors (h, c) required for v4
        self._h = np.zeros((2, 1, 64), dtype=np.float32)
        self._c = np.zeros((2, 1, 64), dtype=np.float32)

    def _reset_states(self):
        """Reset internal recurrent states (e.g., after a conversation ends)."""
        self._h = np.zeros((2, 1, 64), dtype=np.float32)
        self._c = np.zeros((2, 1, 64), dtype=np.float32)
        self._audio_buffer.clear()

    async def process_audio(self, audio_frame: AudioFrame) -> VadState:
        """
        Analyzes an AudioFrame. Buffers internally until enough samples exist.
        Returns VadState.SPEAKING if speech is detected, else SILENCE.
        """
        self._audio_buffer.extend(audio_frame.pcm_data)
        
        current_state = VadState.SILENCE
        
        # Process all complete frames in the buffer
        while len(self._audio_buffer) >= self.bytes_per_frame:
            # Extract a complete frame
            frame_bytes = self._audio_buffer[:self.bytes_per_frame]
            del self._audio_buffer[:self.bytes_per_frame]
            
            # Convert bytes to int16 numpy array
            audio_int16 = np.frombuffer(frame_bytes, dtype=np.int16)
            
            # Normalize to float32 between -1.0 and 1.0 (Silero expects this)
            audio_float32 = audio_int16.astype(np.float32) / 32768.0
            
            # Reshape for ONNX input: (batch_size=1, sequence_length)
            input_tensor = np.expand_dims(audio_float32, axis=0)
            
            # Run inference
            inputs = {
                'input': input_tensor,
                'sr': np.array(self.sample_rate, dtype=np.int64),
                'h': self._h,
                'c': self._c
            }
            
            out, h, c = self.session.run(None, inputs)
            
            # Update state tensors for the next frame
            self._h, self._c = h, c
            
            # out is the probability of speech (0.0 to 1.0)
            speech_prob = float(out[0][0])
            
            if speech_prob > self.threshold:
                current_state = VadState.SPEAKING
                
        return current_state
