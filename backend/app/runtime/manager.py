import asyncio
import uuid
import logging
from typing import Dict, Optional

from .call_runtime import CallRuntime

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
        """Instantiates and registers a new CallRuntime safely."""
        runtime = CallRuntime(agent_id=agent_id, call_id=call_id)
        session_id = runtime.get_session_id()
        
        async with self._lock:
            self._runtimes_by_session_id[session_id] = runtime
            if call_id:
                self._runtimes_by_call_id[call_id] = runtime
                
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
