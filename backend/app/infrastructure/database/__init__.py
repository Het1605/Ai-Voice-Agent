"""
Purpose: Database infrastructure — session management and base model.
Architecture Fit:
  - Provides the SQLAlchemy engine, session factory, and DeclarativeBase
    consumed by all domain models and Alembic migrations.
"""
