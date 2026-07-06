import uuid
import enum
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base


class OrganizationRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class OrganizationMember(Base):
    """
    Association table mapping the many-to-many relationship between Users and Organizations.
    Supports a user belonging to multiple organizations.
    """
    __tablename__ = "organization_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role: Mapped[OrganizationRole] = mapped_column(SAEnum(OrganizationRole, name="organizationrole", create_type=False), default=OrganizationRole.MEMBER, nullable=False)
    
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'organization_id', name='uq_user_organization'),
    )

    user: Mapped["User"] = relationship("User", back_populates="organizations")
    organization: Mapped["Organization"] = relationship("Organization", back_populates="members")
