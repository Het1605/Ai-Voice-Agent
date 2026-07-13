import logging
import uuid
from typing import Optional

from .context import RuntimeContext
from .event_bus import EventBus
from backend.app.voice_engine.events.models import EventType, RuntimeEvent

logger = logging.getLogger(__name__)

class ConversationFlowController:
    """
    The Conversation Flow Controller manages the macro-lifecycle of a conversation.
    While the ConversationEngine executes tasks via Provider Contracts, this Controller 
    decides *what* turn it is (e.g. USER_TURN vs AI_TURN) and strictly manages the overall 
    State Machine transitions for the CallRuntime.
    """
    def __init__(
        self,
        session_id: uuid.UUID,
        context: RuntimeContext,
        event_bus: EventBus
    ):
        self.session_id = session_id
        self.context = context
        self.event_bus = event_bus
        
        # Subscribe to high-level lifecycle events
        self.event_bus.subscribe(EventType.CALL_STARTED, self.on_call_started)
        self.event_bus.subscribe(EventType.USER_STARTED_SPEAKING, self.on_user_started_speaking)
        self.event_bus.subscribe(EventType.TRANSCRIPT_READY, self.on_transcript_ready)
        self.event_bus.subscribe(EventType.AI_SPEAKING_COMPLETED, self.on_ai_speaking_completed)
        self.event_bus.subscribe(EventType.CONVERSATION_COMPLETED, self.on_conversation_completed)

    def _update_turn(self, turn: str):
        """Helper to cleanly update the macro conversational turn."""
        self.context.update_metadata("current_turn", turn)
        logger.debug(f"[{self.session_id}] Flow transitioned to {turn}")

    async def on_call_started(self, event: RuntimeEvent):
        """
        When a call starts, the AI typically speaks first (e.g. Welcome message),
        so we initialize the flow to WAITING_FOR_USER_INPUT.
        """
        self._update_turn("WAITING_FOR_USER_INPUT")
        logger.info(f"[{self.session_id}] Conversation Flow initialized.")

    async def on_user_started_speaking(self, event: RuntimeEvent):
        """User barged in or began their turn."""
        self._update_turn("USER_TURN")

    async def on_transcript_ready(self, event: RuntimeEvent):
        """User finished speaking and the transcript is processed. Hand off to AI."""
        self._update_turn("AI_TURN")

    async def on_ai_speaking_completed(self, event: RuntimeEvent):
        """AI finished its response. Return control to the user."""
        self._update_turn("WAITING_FOR_USER_INPUT")

    async def on_conversation_completed(self, event: RuntimeEvent):
        """
        The conversation has naturally concluded (e.g. user said goodbye).
        Trigger a shutdown request to politely kill the CallRuntime.
        """
        logger.info(f"[{self.session_id}] Conversation completed natively. Triggering shutdown.")
        self.event_bus.publish(RuntimeEvent(
            event_type=EventType.SHUTDOWN_REQUESTED,
            session_id=self.session_id
        ))
