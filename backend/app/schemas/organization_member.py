import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.models.organization_member import OrganizationRole

class OrganizationMemberBase(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role: OrganizationRole = OrganizationRole.MEMBER

class OrganizationMemberCreate(OrganizationMemberBase):
    pass

class OrganizationMemberUpdate(BaseModel):
    role: OrganizationRole

from backend.app.schemas.organization import OrganizationResponse

class OrganizationMemberResponse(OrganizationMemberBase):
    id: uuid.UUID
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrganizationMemberWithOrgResponse(OrganizationMemberResponse):
    organization: OrganizationResponse
