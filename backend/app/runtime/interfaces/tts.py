from abc import ABC, abstractmethod
from typing import AsyncGenerator

class IAudioSynthesizer(ABC):
    """
    Contract for Text-to-Speech (TTS) providers.
    The Runtime expects this provider to take an AI-generated text string
    and yield playable audio bytes.
    """
    
    @abstractmethod
    async def generate_audio_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Takes a string of text and yields raw playable audio bytes as fast 
        as they are synthesized.
        """
        pass
