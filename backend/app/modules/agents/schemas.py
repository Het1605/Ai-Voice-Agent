import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AgentBase(BaseModel):
    name: str = Field(..., max_length=255, description="The name of the agent")
    description: Optional[str] = Field(None, max_length=1000, description="Description of what the agent does")
    is_active: bool = Field(True, description="Whether the agent is active and can take calls")
    default_language: str = Field("en", max_length=10, description="Default language code, e.g. en-US")
    system_prompt: Optional[str] = Field(None, description="The base instructions/persona for the agent")


class AgentCreate(AgentBase):
    organization_id: uuid.UUID = Field(..., description="ID of the organization this agent belongs to")
    # created_by_id will be injected by the service layer based on the current user


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None
    default_language: Optional[str] = Field(None, max_length=10)
    system_prompt: Optional[str] = None


class AgentResponse(AgentBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    created_by_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
