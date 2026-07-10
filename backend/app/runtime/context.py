from typing import Any, Dict, Optional
from datetime import datetime, UTC
from pydantic import BaseModel, Field

class RuntimeContext(BaseModel):
    """
    Represents the temporary execution environment of a single active phone call.
    This contains only the runtime information required while the conversation is executing.
    It acts as a flexible registry where future modules (Event Bus, State Machine, etc.)
    can attach their references safely.
    
    This does NOT contain conversation history, business logic, or provider implementations.
    """
    # Timestamps
    initialized_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_event_at: Optional[datetime] = None
    
    # Internal Metadata & Temporary Execution Data
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Conversation History
    history: list[Dict[str, str]] = Field(default_factory=list)
    
    # Future Module Attachments (Placeholders for dependency injection)
    # These will be populated as those components are implemented, without
    # needing to change this core structure.
    components: Dict[str, Any] = Field(default_factory=dict)
    
    def set_component(self, name: str, component: Any):
        """Attaches a runtime component (e.g., EventBus, StateMachine) to this context."""
        self.components[name] = component
        
    def get_component(self, name: str) -> Optional[Any]:
        """Retrieves an attached runtime component."""
        return self.components.get(name)

    def update_metadata(self, key: str, value: Any):
        """Stores temporary execution data."""
        self.metadata[key] = value
        self.last_event_at = datetime.now(UTC)
        
    def get_metadata(self, key: str) -> Optional[Any]:
        """Retrieves temporary execution data."""
        return self.metadata.get(key)

    def clear(self):
        """Aggressively clears the execution environment to prevent memory leaks."""
        self.components.clear()
        self.metadata.clear()
