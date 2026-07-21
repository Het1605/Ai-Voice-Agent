"""
Purpose: Defines Pydantic schemas for authentication flows.
Responsibilities:
  - Validates login requests.
  - Formats token and user responses for successful authentications.
"""

from pydantic import BaseModel, EmailStr
from backend.app.modules.users.schemas import UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class LoginResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class MessageResponse(BaseModel):
    message: str
