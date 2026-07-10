from abc import ABC, abstractmethod

from typing import Optional
from pydantic import BaseModel

class TranscriptionResult(BaseModel):
    """Structured response from the STT provider."""
    text: str
    confidence: Optional[float] = None
    language: Optional[str] = None
    metadata: Optional[dict] = None

class IAudioTranscriber(ABC):
    """
    Contract for Speech-to-Text (STT) providers.
    The Runtime uses this to stream raw audio bytes and expects the provider 
    to return a structured TranscriptionResult.
    """
    
    @abstractmethod
    async def start_stream(self) -> None:
        """Initializes the connection to the STT provider."""
        pass
        
    @abstractmethod
    async def process_audio(self, audio_chunk: bytes) -> TranscriptionResult:
        """
        Sends raw audio bytes to the provider and returns the transcription.
        """
        pass
        
    @abstractmethod
    async def close_stream(self) -> None:
        """Cleanly terminates the STT stream."""
        pass
