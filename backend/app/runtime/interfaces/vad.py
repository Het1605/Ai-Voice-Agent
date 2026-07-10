from abc import ABC, abstractmethod
from enum import Enum

class VadState(str, Enum):
    SPEAKING = "SPEAKING"
    SILENCE = "SILENCE"

class IVoiceActivityDetector(ABC):
    """
    Contract for Voice Activity Detection (VAD).
    The Runtime uses this to determine if the user has started or stopped speaking.
    """
    
    @abstractmethod
    async def process_audio(self, audio_chunk: bytes) -> VadState:
        """
        Analyzes a raw audio chunk and returns the current state (SPEAKING or SILENCE).
        """
        pass
