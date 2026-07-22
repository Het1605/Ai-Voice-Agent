from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
import uuid

class OrganizationBase(BaseModel):
    name: str = Field(..., max_length=255)
    is_active: bool = True

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None

class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.domain.organization.models import OrganizationRole

class OrganizationMemberBase(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role: OrganizationRole = OrganizationRole.MEMBER

class OrganizationMemberCreate(OrganizationMemberBase):
    pass

class OrganizationMemberUpdate(BaseModel):
    role: OrganizationRole

from app.domain.organization.schemas import OrganizationResponse

class OrganizationMemberResponse(OrganizationMemberBase):
    id: uuid.UUID
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrganizationMemberWithOrgResponse(OrganizationMemberResponse):
    organization: OrganizationResponse
