"""
Purpose: Initializes the models package.
Responsibilities:
  - Exports database models to make them easily importable.
  - Ensures models are registered with SQLAlchemy's Base.metadata for Alembic autogeneration.
"""

from backend.app.models.user import User
