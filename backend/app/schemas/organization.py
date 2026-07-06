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
