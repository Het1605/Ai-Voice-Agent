"""
Purpose: Centralized database foundation for SQL relational storage.
Responsibilities:
  - Initializes the asynchronous SQLAlchemy engine using application settings.
  - Declares the standard base model (Base) for ORM classes.
  - Configures the asynchronous session factory.
  - Exposes the get_db context manager dependency for FastAPI endpoints.
Architecture Fit:
  - Loaded by FastAPI endpoint dependencies to inject db sessions.
  - Used by Alembic migrations (env.py) to read database schemas.
  - Subclassed by all database repository models.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Create the primary asynchronous SQLAlchemy database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True if query logging is needed in development
    future=True
)

# Async session factory
SessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession
)

class Base(DeclarativeBase):
    """
    Common base class for all database models.
    Uses SQLAlchemy 2.0 Declarative style.
    """
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency injection provider.
    Yields an active database session and ensures proper close handling.
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
