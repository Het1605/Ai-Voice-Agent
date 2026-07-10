from abc import ABC, abstractmethod
from typing import AsyncGenerator

from backend.app.runtime.context import RuntimeContext

class ILLMGenerator(ABC):
    """
    Contract for Large Language Model (LLM) providers.
    The Runtime expects this provider to take the active context and yield 
    a stream of text tokens.
    """
    
    @abstractmethod
    async def generate_response_stream(self, context: RuntimeContext) -> AsyncGenerator[str, None]:
        """
        Reads the conversational history from the RuntimeContext and yields 
        the AI's text response token-by-token.
        """
        pass
