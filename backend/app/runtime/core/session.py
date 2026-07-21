import uuid
from datetime import datetime, UTC
from typing import Optional
from pydantic import BaseModel, Field

class CallSession(BaseModel):
    """
    Represents the metadata and lifecycle of a single phone call.
    This holds business-agnostic identifiers required to track the call
    across the system and eventually sync to the database.
    """
    session_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    agent_id: Optional[uuid.UUID] = None
    call_id: Optional[str] = None  # Telephony provider ID (e.g., Twilio CallSid)
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    ended_at: Optional[datetime] = None
    
    def end_session(self):
        """Marks the session as completed."""
        self.ended_at = datetime.now(UTC)
