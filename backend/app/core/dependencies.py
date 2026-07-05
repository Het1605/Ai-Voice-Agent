"""
Purpose: Centralized dependency injection providers for FastAPI routes.
Responsibilities:
  - Re-exports database session providers and Redis client providers.
  - Exposes configuration settings provider for easy routing access and testing mocks.
Architecture Fit:
  - Imported by API routers to inject infrastructure dependencies.
  - Keeps business modules decoupled from underlying database and cache services.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from backend.app.core.config import Settings, settings
from backend.app.core.database import get_db
from backend.app.core.redis_service import get_redis

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Exposes database connection dependency.
    Yields an active asynchronous SQLAlchemy session.
    """
    async for session in get_db():
        yield session

async def get_redis_client() -> AsyncGenerator[Redis, None]:
    """
    Exposes Redis connection dependency.
    Yields the global asynchronous Redis connection client.
    """
    async for client in get_redis():
        yield client

def get_app_settings() -> Settings:
    """
    Exposes settings configuration dependency.
    Returns the initialized Settings class instance.
    """
    return settings
