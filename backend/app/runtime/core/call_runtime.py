import uuid
import logging
from typing import Optional

from .session import CallSession
from .context import RuntimeContext
from .event_bus import EventBus
from backend.app.runtime.events.models import RuntimeEvent, EventType
from backend.app.runtime.core.audio import AudioFrame
import asyncio
from .session_sync import SessionSynchronizer
from .engine import ConversationEngine
from .flow_controller import ConversationFlowController

logger = logging.getLogger(__name__)

class CallRuntime:
    """
    The master orchestrator for a single active AI phone call.
    This class enforces strict isolation boundaries and a predictable lifecycle.
    """
    def __init__(self, agent_id: Optional[uuid.UUID] = None, call_id: Optional[str] = None, orchestrator=None):
        """Birth: Creates the isolated business and execution containers."""
        self.session = CallSession(agent_id=agent_id, call_id=call_id)
        self.context = RuntimeContext()
        self.event_bus = EventBus()
        
        # Instantiate and bind the Session Synchronizer purely via dependency injection
        self.synchronizer = SessionSynchronizer(
            session=self.session,
            context=self.context,
            event_bus=self.event_bus
        )
        
        # Instantiate the Conversation Engine (The Executor)
        self.conversation_engine = ConversationEngine(
            session_id=self.session.session_id,
            context=self.context,
            event_bus=self.event_bus,
            orchestrator=orchestrator
        )
        
        # Instantiate the Conversation Flow Controller (The Navigator)
        self.flow_controller = ConversationFlowController(
            session_id=self.session.session_id,
            context=self.context,
            event_bus=self.event_bus
        )
        
        self._is_active = False
        
        # Audio output streaming queue (populated by internal events)
        self.audio_out_queue: asyncio.Queue = asyncio.Queue()
        self.event_bus.subscribe(EventType.AUDIO_OUT, self._handle_audio_out)
        
        # Attach components to the runtime context registry immediately
        self.initialize(
            event_bus=self.event_bus, 
            session_synchronizer=self.synchronizer,
            conversation_engine=self.conversation_engine,
            flow_controller=self.flow_controller
        )
        
        logger.info(f"CallRuntime created for session {self.session.session_id}")

    def initialize(self, **components):
        """
        Dependency Injection: Attaches future modules (e.g., Event Bus, State Machine)
        safely into the RuntimeContext without changing this core architecture.
        """
        for name, component in components.items():
            self.context.set_component(name, component)
            logger.debug(f"Attached component '{name}' to session {self.session.session_id}")

    # ---------------------------------------------------------
    # Public Gateway API (Encapsulates EventBus from Transports)
    # ---------------------------------------------------------
    
    def receive_audio(self, frame: AudioFrame):
        """Called by a Gateway/Bridge when new audio is decoded from the network."""
        if not self._is_active:
            return
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.AUDIO_IN,
            session_id=self.session.session_id,
            payload={"audio_frame": frame}
        ))
        
    async def get_audio_out(self) -> AudioFrame:
        """Called by a Gateway/Bridge to await the next outgoing AudioFrame."""
        return await self.audio_out_queue.get()
        
    def interrupt(self):
        """Called by a Gateway/Bridge to forcefully interrupt the AI."""
        if self._is_active:
            self.conversation_engine.interrupt()
            
    async def _handle_audio_out(self, event: RuntimeEvent):
        """Internal callback to push TTS AudioFrames to the output queue."""
        frame = event.payload.get("audio_frame")
        if frame and isinstance(frame, AudioFrame):
            await self.audio_out_queue.put(frame)
            return

    def start(self):
        """Kicks off the active phone call."""
        if self._is_active:
            logger.warning(f"Session {self.session.session_id} is already active.")
            return
            
        self._is_active = True
        self.context.update_metadata("call_status", "in_progress")
        logger.info(f"CallRuntime started for session {self.session.session_id}")
        
        # Fire initial event
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.CALL_STARTED,
            session_id=self.session.session_id
        ))

    def get_session_id(self) -> uuid.UUID:
        return self.session.session_id

    def shutdown(self):
        """
        Gracefully stops the active call, cleanly closing any attached components
        and marking the session end time.
        """
        self._is_active = False
        self.session.end_session()
        self.context.update_metadata("call_status", "completed")
        
        # Fire final event before teardown
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.CALL_ENDED,
            session_id=self.session.session_id
        ))
        
        logger.info(f"CallRuntime shutdown gracefully for session {self.session.session_id}")
        self.cleanup()

    def cleanup(self):
        """
        Death: Aggressively deletes the RuntimeContext dictionaries to force
        immediate garbage collection and prevent server memory leaks.
        """
        self.context.clear()
        logger.info(f"CallRuntime resources cleaned up for session {self.session.session_id}")
