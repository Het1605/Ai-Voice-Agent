"""
Purpose: Defines Pydantic schemas for the User model.
Responsibilities:
  - Data validation for incoming API requests (Create, Update).
  - Serialization of User database models for API responses.
Architecture Fit:
  - Ensures type-safety at the API boundary before hitting business logic or database.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    """
    Shared properties for all user schemas.
    """
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """
    Properties required to create a new user.
    """
    password: str


class UserUpdate(BaseModel):
    """
    Properties allowed to be updated. All fields are optional to support partial updates (PATCH).
    """
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """
    Properties returned to the client in API responses.
    """
    id: UUID
    is_superuser: bool
    is_verified: bool
    role: str
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
