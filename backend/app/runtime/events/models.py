import uuid
from enum import Enum
from datetime import datetime, UTC
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class EventType(str, Enum):
    # Lifecycle
    CALL_STARTED = "CALL_STARTED"
    CALL_ENDED = "CALL_ENDED"
    STATE_CHANGED = "STATE_CHANGED"
    
    # Audio & Voice Activity
    USER_STARTED_SPEAKING = "USER_STARTED_SPEAKING"
    USER_STOPPED_SPEAKING = "USER_STOPPED_SPEAKING"
    
    # Placeholders for future Provider events
    # TRANSCRIPT_READY = "TRANSCRIPT_READY"
    # LLM_TOKEN = "LLM_TOKEN"

class RuntimeEvent(BaseModel):
    """
    The base structure for every event fired within the AI Runtime.
    """
    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: EventType
    session_id: uuid.UUID
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    correlation_id: Optional[uuid.UUID] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
