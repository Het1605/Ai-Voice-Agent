import asyncio
from typing import AsyncGenerator
import logging

from app.runtime.ports import (
    IVoiceActivityDetector, VadState,
    IAudioTranscriber,
    ILLMGenerator,
    IAudioSynthesizer,
    IOrchestrator
)
from app.runtime.core.context import RuntimeContext
from app.runtime.core.event_bus import EventBus
from app.runtime.events.models import EventType, RuntimeEvent

logger = logging.getLogger(__name__)


class MockVAD(IVoiceActivityDetector):
    async def process_audio(self, audio_chunk: bytes) -> VadState:
        # A mock implementation that just returns SILENCE unless coerced
        return VadState.SILENCE


class MockSTT(IAudioTranscriber):
    def __init__(self, event_bus: EventBus, session_id):
        self.event_bus = event_bus
        self.session_id = session_id
        
    async def start_stream(self) -> None:
        pass
        
    async def process_audio(self, audio_chunk: bytes) -> None:
        # Simulate STT processing delay
        await asyncio.sleep(0.1)
        # Push transcript to EventBus
        logger.info(f"[MockSTT] Firing TRANSCRIPT_READY event")
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.TRANSCRIPT_READY,
            session_id=self.session_id,
            payload={"text": "Mock user transcript"}
        ))
        
    async def close_stream(self) -> None:
        pass


class MockLLM(ILLMGenerator):
    async def generate_response_stream(self, context: RuntimeContext) -> AsyncGenerator[str, None]:
        tokens = ["Hello", " ", "human", "!", " ", "I", " ", "am", " ", "AI."]
        for token in tokens:
            await asyncio.sleep(0.01)
            yield token


class MockTTS(IAudioSynthesizer):
    async def generate_audio_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        # Fake audio byte chunks
        for _ in range(3):
            await asyncio.sleep(0.01)
            yield b"\\x00\\x00\\x00"


class MockOrchestrator(IOrchestrator):
    def __init__(self, llm: ILLMGenerator, tts: IAudioSynthesizer, event_bus: EventBus, session_id):
        self.llm = llm
        self.tts = tts
        self.event_bus = event_bus
        self.session_id = session_id
        self._interrupted = False

    async def process_turn(self, context: RuntimeContext) -> None:
        self._interrupted = False
        logger.info(f"[MockOrchestrator] Starting turn processing...")
        
        # 1. Generate text
        full_text = ""
        async for token in self.llm.generate_response_stream(context):
            if self._interrupted:
                logger.warning("[MockOrchestrator] Interrupted during LLM generation!")
                return
            full_text += token
            
        logger.info(f"[MockOrchestrator] LLM Output: {full_text}")
            
        # 2. Synthesize audio
        async for chunk in self.tts.generate_audio_stream(full_text):
            if self._interrupted:
                logger.warning("[MockOrchestrator] Interrupted during TTS synthesis!")
                return
            pass # Typically we'd stream this out over a websocket
            
        logger.info("[MockOrchestrator] Turn processing completed. Firing AI_SPEAKING_COMPLETED")
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.AI_SPEAKING_COMPLETED,
            session_id=self.session_id
        ))

    async def handle_interruption(self) -> None:
        logger.warning("[MockOrchestrator] Interruption signal received!")
        self._interrupted = True
