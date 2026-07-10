import logging
import uuid
from typing import Optional

from .context import RuntimeContext
from .event_bus import EventBus
from .events.models import EventType, RuntimeEvent
from .interfaces import IOrchestrator

logger = logging.getLogger(__name__)

class ConversationEngine:
    """
    The Conversation Engine acts as the 'brain' or traffic controller of the phone call.
    It strictly adheres to state machine rules and commands external providers through 
    abstract contracts (Ports), without containing any provider-specific code itself.
    """
    def __init__(
        self,
        session_id: uuid.UUID,
        context: RuntimeContext,
        event_bus: EventBus,
        orchestrator: Optional[IOrchestrator] = None
    ):
        self.session_id = session_id
        self.context = context
        self.event_bus = event_bus
        self.orchestrator = orchestrator
        
        # Subscribe to strict state transitions
        self.event_bus.subscribe(EventType.TRANSCRIPT_READY, self.handle_transcript)
        self.event_bus.subscribe(EventType.USER_STARTED_SPEAKING, self.handle_interruption)
        self.event_bus.subscribe(EventType.AI_SPEAKING_COMPLETED, self.handle_speaking_completed)

    async def handle_transcript(self, event: RuntimeEvent):
        """
        Triggered when STT successfully returns a final user utterance.
        Transitions the state to THINKING and commands the Orchestrator.
        """
        text = event.payload.get("text")
        if not text:
            return
            
        logger.info(f"[{self.session_id}] Received Transcript: '{text}'")
        
        # Update state
        self.context.update_metadata("conversation_state", "THINKING")
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.STATE_CHANGED,
            session_id=self.session_id,
            payload={"state": "THINKING"}
        ))
        
        # Command Orchestrator to think
        if self.orchestrator:
            await self.orchestrator.process_turn(self.context)

    async def handle_interruption(self, event: RuntimeEvent):
        """
        Triggered when VAD detects the user has started speaking (Barge-in).
        Immediately violently halts any active Orchestrator/LLM/TTS streams.
        """
        current_state = self.context.get_metadata("conversation_state")
        
        # We only barge-in if the AI is currently thinking or speaking
        if current_state in ["THINKING", "SPEAKING"]:
            logger.warning(f"[{self.session_id}] Barge-in detected! Halting AI streams.")
            
            # Transition safely back to listening
            self.context.update_metadata("conversation_state", "LISTENING")
            self.event_bus.publish(RuntimeEvent(
                event_type=EventType.STATE_CHANGED,
                session_id=self.session_id,
                payload={"state": "LISTENING"}
            ))
            
            # Force stop the orchestrator
            if self.orchestrator:
                await self.orchestrator.handle_interruption()

    async def handle_speaking_completed(self, event: RuntimeEvent):
        """
        Triggered when the TTS has finished playing all audio bytes to the user.
        Transitions the state back to LISTENING.
        """
        logger.debug(f"[{self.session_id}] AI finished speaking.")
        self.context.update_metadata("conversation_state", "LISTENING")
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.STATE_CHANGED,
            session_id=self.session_id,
            payload={"state": "LISTENING"}
        ))
