"""
Purpose: Centralized Redis service connection management.
Responsibilities:
  - Instantiates the asynchronous Redis client using application configurations.
  - Exposes health checks to assert Redis cache connectivity at boot.
  - Exposes the get_redis context manager dependency for API routes.
Architecture Fit:
  - Loaded at startup inside main.py to verify caching connectivity.
  - Injected into routers/services requiring fast state cache or queues.
"""

from typing import AsyncGenerator
import redis.asyncio as redis
from backend.app.core.config import settings

# Initialize the global asynchronous Redis connection client
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    encoding="utf-8"
)

async def ping_redis() -> bool:
    """
    Checks the Redis cache connection health.
    Returns True if connection ping is successful, False otherwise.
    """
    try:
        return await redis_client.ping()
    except Exception:
        return False

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    """
    FastAPI dependency injection provider.
    Yields the active asynchronous Redis client instance.
    """
    yield redis_client
