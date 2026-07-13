
from abc import ABC, abstractmethod
from typing import AsyncGenerator

from backend.app.voice_engine.core.context import RuntimeContext

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
from abc import ABC, abstractmethod

from backend.app.voice_engine.core.context import RuntimeContext

class IOrchestrator(ABC):
    """
    Contract for the Conversation Orchestrator (The Brain).
    The Runtime delegates the 'thinking' phase to this orchestrator.
    Future adapters (like a LangGraphOrchestrator) will implement this.
    """
    
    @abstractmethod
    async def process_turn(self, context: RuntimeContext) -> None:
        """
        Triggered by the Runtime when it is the AI's turn to speak.
        The orchestrator reads the context, queries the LLM, and directs 
        the response back to the Runtime.
        """
        pass
        
    @abstractmethod
    async def handle_interruption(self) -> None:
        """
        Triggered violently by the Runtime if the user speaks (barge-in) 
        while the orchestrator is in the middle of processing a turn.
        The orchestrator must halt its current execution immediately.
        """
        pass
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
from abc import ABC, abstractmethod
from typing import Any, Dict

from backend.app.voice_engine.core.context import RuntimeContext

class IWorkflowEngine(ABC):
    """
    Contract for a complex reasoning Workflow Engine (e.g., LangGraph).
    The Orchestrator delegates tool calls to this engine for execution.
    """
    
    @abstractmethod
    async def execute_tool(self, tool_name: str, tool_args: Dict[str, Any], context: RuntimeContext) -> str:
        """
        Executes a multi-step workflow or tool based on the tool_name and arguments.
        Returns a string response to be injected back into the LLM context or spoken directly.
        """
        pass
