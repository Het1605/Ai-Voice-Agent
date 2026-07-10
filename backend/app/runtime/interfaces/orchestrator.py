from abc import ABC, abstractmethod

from backend.app.runtime.context import RuntimeContext

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
