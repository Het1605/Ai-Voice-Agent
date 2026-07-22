import asyncio
import uuid
import logging
from typing import Dict, Optional

from .call_runtime import CallRuntime
from app.runtime.events.models import EventType

logger = logging.getLogger(__name__)

class RuntimeManager:
    """
    The global registry and orchestrator for all active CallRuntime instances.
    This singleton ensures safe creation, lookup, and cleanup of runtimes under high concurrency.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RuntimeManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self._runtimes_by_session_id: Dict[uuid.UUID, CallRuntime] = {}
        self._runtimes_by_call_id: Dict[str, CallRuntime] = {}
        self._lock = asyncio.Lock()
        self._initialized = True
        logger.info("RuntimeManager initialized")

    async def create_runtime(self, agent_id: Optional[uuid.UUID] = None, call_id: Optional[str] = None) -> CallRuntime:
        """Instantiates and registers a new CallRuntime safely. Acts as the DI Factory."""
        # 1. Instantiate Core Adapters
        from app.infrastructure.ai.silero import SileroVadAdapter
        from app.infrastructure.ai.faster_whisper import FasterWhisperAdapter
        from app.infrastructure.ai.kokoro import KokoroAdapter
        from app.infrastructure.ai.ollama import OllamaAdapter
        from app.infrastructure.workflows.mock import MockWorkflowAdapter
        
        vad = SileroVadAdapter()
        stt = FasterWhisperAdapter()
        await stt.start_stream()
        tts = KokoroAdapter()
        llm = OllamaAdapter()
        wf = MockWorkflowAdapter()
        
        # 2. Instantiate Runtime and Orchestrator
        runtime = CallRuntime(agent_id=agent_id, call_id=call_id)
        session_id = runtime.get_session_id()
        
        from app.runtime.orchestrators.hybrid import HybridOrchestrator
        orchestrator = HybridOrchestrator(
            llm=llm,
            tts=tts,
            event_bus=runtime.event_bus,
            session_id=session_id,
            workflow_engine=wf
        )
        runtime.conversation_engine.orchestrator = orchestrator
        
        # 3. Instantiate AudioPipeline
        from app.runtime.core.audio_pipeline import AudioPipeline
        audio_pipeline = AudioPipeline(
            session_id=str(session_id),
            event_bus=runtime.event_bus,
            vad=vad,
            stt=stt
        )
        
        # Attach to runtime context
        runtime.initialize(
            orchestrator=orchestrator,
            audio_pipeline=audio_pipeline,
            stt_adapter=stt
        )
        
        async with self._lock:
            self._runtimes_by_session_id[session_id] = runtime
            if call_id:
                self._runtimes_by_call_id[call_id] = runtime
                
        # Subscribe to shutdown requests to safely deregister
        async def _on_shutdown(event):
            # Clean up the STT stream
            if hasattr(runtime.context, "get_component"):
                stt_ref = runtime.context.get_component("stt_adapter")
                if stt_ref:
                    await stt_ref.close_stream()
            await self.end_runtime(event.session_id)
            
        runtime.event_bus.subscribe(EventType.SHUTDOWN_REQUESTED, _on_shutdown)
                
        logger.info(f"Registered CallRuntime {session_id} (Call ID: {call_id})")
        return runtime

    async def get_runtime(self, session_id: Optional[uuid.UUID] = None, call_id: Optional[str] = None) -> Optional[CallRuntime]:
        """Looks up an active runtime by session_id or call_id."""
        async with self._lock:
            if session_id and session_id in self._runtimes_by_session_id:
                return self._runtimes_by_session_id[session_id]
            if call_id and call_id in self._runtimes_by_call_id:
                return self._runtimes_by_call_id[call_id]
        return None

    async def end_runtime(self, session_id: uuid.UUID):
        """Safely shuts down a runtime and removes it from the registry."""
        async with self._lock:
            runtime = self._runtimes_by_session_id.get(session_id)
            if not runtime:
                logger.warning(f"Attempted to end unknown Runtime {session_id}")
                return
                
            runtime.shutdown()
            
            # Remove from registries
            del self._runtimes_by_session_id[session_id]
            call_id = runtime.session.call_id
            if call_id and call_id in self._runtimes_by_call_id:
                del self._runtimes_by_call_id[call_id]
                
        logger.info(f"Deregistered CallRuntime {session_id}")

# Global singleton instance
runtime_manager = RuntimeManager()
