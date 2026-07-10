from abc import ABC, abstractmethod

class IAudioTranscriber(ABC):
    """
    Contract for Speech-to-Text (STT) providers.
    The Runtime uses this to stream raw audio bytes and expects the provider 
    to push transcripts back onto the EventBus.
    """
    
    @abstractmethod
    async def start_stream(self) -> None:
        """Initializes the connection to the STT provider."""
        pass
        
    @abstractmethod
    async def process_audio(self, audio_chunk: bytes) -> None:
        """
        Sends raw audio bytes to the provider. 
        This method must be non-blocking. The adapter is responsible for pushing 
        the resulting text onto the Runtime's EventBus.
        """
        pass
        
    @abstractmethod
    async def close_stream(self) -> None:
        """Cleanly terminates the STT stream."""
        pass
