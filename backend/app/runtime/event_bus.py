import asyncio
import logging
from typing import Callable, Dict, List
from collections import defaultdict

from .events.models import EventType, RuntimeEvent

logger = logging.getLogger(__name__)

class EventBus:
    """
    An ultra-low latency, in-memory, asynchronous Event Bus.
    This bus is strictly isolated to a single CallRuntime and should never
    be shared between different phone calls.
    """
    def __init__(self):
        # Maps an EventType to a list of asynchronous callback functions
        self.subscribers: Dict[EventType, List[Callable]] = defaultdict(list)

    def subscribe(self, event_type: EventType, handler: Callable):
        """Registers an async handler for a specific event type."""
        self.subscribers[event_type].append(handler)
        logger.debug(f"Registered handler for {event_type.value}")

    def publish(self, event: RuntimeEvent):
        """
        Instantly fires off the event to all registered subscribers.
        Dispatches concurrently via asyncio.create_task to ensure that
        no single slow subscriber can block the rest of the runtime.
        """
        handlers = self.subscribers.get(event.event_type, [])
        if not handlers:
            logger.debug(f"Event {event.event_type.value} published, but no subscribers found.")
            return

        for handler in handlers:
            # We wrap the execution in a task to achieve non-blocking concurrency.
            asyncio.create_task(self._execute_handler(handler, event))

    async def _execute_handler(self, handler: Callable, event: RuntimeEvent):
        """Safely executes a single handler, catching and logging any exceptions."""
        try:
            await handler(event)
        except Exception as e:
            logger.error(f"Error executing handler for {event.event_type.value}: {e}", exc_info=True)
