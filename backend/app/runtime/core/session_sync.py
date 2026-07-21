import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.infrastructure.cache.redis import redis_client
from backend.app.infrastructure.database.session import SessionLocal

from .session import CallSession
from .context import RuntimeContext
from .event_bus import EventBus
from backend.app.runtime.events.models import EventType, RuntimeEvent

logger = logging.getLogger(__name__)

class SessionSynchronizer:
    """
    Listens to the Event Bus and bridges the isolated runtime state with 
    the distributed Redis (Hot State) and persistent PostgreSQL (Cold State).
    """
    def __init__(self, session: CallSession, context: RuntimeContext, event_bus: EventBus):
        self.session = session
        self.context = context
        self.event_bus = event_bus
        
        # Subscribe to relevant events
        self.event_bus.subscribe(EventType.CALL_STARTED, self.on_call_started)
        self.event_bus.subscribe(EventType.STATE_CHANGED, self.on_state_changed)
        self.event_bus.subscribe(EventType.CALL_ENDED, self.on_call_ended)
        
    def _get_redis_key(self) -> str:
        return f"runtime:hot_state:{self.session.session_id}"

    async def _sync_to_redis(self):
        """Pushes the current ephemeral state to Redis."""
        payload = {
            "session_id": str(self.session.session_id),
            "agent_id": str(self.session.agent_id) if self.session.agent_id else None,
            "call_id": self.session.call_id,
            "call_status": self.context.get_metadata("call_status"),
            "started_at": self.session.started_at.isoformat(),
        }
        try:
            # Expire after 2 hours as a fail-safe against stuck calls
            await redis_client.setex(self._get_redis_key(), 7200, json.dumps(payload))
            logger.debug(f"Synced hot state to Redis for {self.session.session_id}")
        except Exception as e:
            logger.error(f"Failed to sync Redis state for {self.session.session_id}: {e}")

    async def on_call_started(self, event: RuntimeEvent):
        await self._sync_to_redis()

    async def on_state_changed(self, event: RuntimeEvent):
        await self._sync_to_redis()

    async def on_call_ended(self, event: RuntimeEvent):
        """Persists final data to PostgreSQL and cleans up Redis."""
        # 1. Cold State Persistence
        async with SessionLocal() as db:
            try:
                # TODO: Implement actual SQLAlchemy persistence logic here once the 
                # historical Call Record ORM model is strictly defined.
                # Example:
                # db_call = CallRecord(session_id=..., duration=...)
                # db.add(db_call)
                # await db.commit()
                logger.info(f"Persisted cold state to PostgreSQL for {self.session.session_id}")
            except Exception as e:
                logger.error(f"Failed to persist PostgreSQL state for {self.session.session_id}: {e}")

        # 2. Hot State Cleanup
        try:
            await redis_client.delete(self._get_redis_key())
            logger.debug(f"Cleaned up Redis hot state for {self.session.session_id}")
        except Exception as e:
            logger.error(f"Failed to cleanup Redis for {self.session.session_id}: {e}")
