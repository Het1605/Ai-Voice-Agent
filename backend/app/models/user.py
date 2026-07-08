"""
Purpose: Defines the SQLAlchemy database model for the User entity.
Responsibilities:
  - Maps user properties to the database schema.
  - Establishes core authentication and audit fields.
Architecture Fit:
  - Foundation for the Authentication & Authorization module.
  - To be extended with relationships to Organizations and Agents in future modules.
"""

from datetime import datetime, timezone
import uuid
import enum
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.app.core.database import Base


class SystemRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    # Primary key
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Core identity and authentication
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    
    # Profile information
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Status flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String, default=SystemRole.USER.value)

    # Security and login tracking
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    account_locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    organizations: Mapped[list["OrganizationMember"]] = relationship(
        "OrganizationMember", 
        back_populates="user", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    created_agents: Mapped[list["Agent"]] = relationship(
        "Agent",
        back_populates="creator",
        lazy="selectin"
    )

    # Audit timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
