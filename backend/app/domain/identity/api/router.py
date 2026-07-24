"""
Purpose: API endpoints for authentication (Register, Login).
Responsibilities:
  - Exposes HTTP POST routes for user registration and authentication.
  - Keeps routing layer thin by delegating logic to AuthService.
Architecture Fit:
  - Mounted on the main FastAPI router.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db_session
from app.domain.identity.dependencies import oauth2_scheme
from app.domain.users.schemas import UserCreate, UserResponse
from app.domain.identity.schemas import LoginRequest, LoginResponse, RefreshTokenRequest, TokenResponse, MessageResponse
from app.domain.identity.services.service import AuthService
from app.core.response import APIResponse, success_response

router = APIRouter()

@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Register a new user.
    """
    user = await AuthService.register_user(db, user_in)
    return success_response(user)


@router.post("/login", response_model=APIResponse[LoginResponse], status_code=status.HTTP_200_OK)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Authenticate a user and return access/refresh tokens.
    """
    # 1. Authenticate user credentials
    user = await AuthService.authenticate_user(db, login_in.email, login_in.password)

    # 2. Generate JWT tokens
    tokens = AuthService.generate_tokens(user)

    # 3. Construct response combining user data and tokens
    return success_response(
        LoginResponse(
            user=UserResponse.model_validate(user),
            tokens=tokens
        )
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse], status_code=status.HTTP_200_OK)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Generate a new access token (and refresh token) using a valid refresh token.
    """
    tokens = await AuthService.refresh_access_token(db, request.refresh_token)
    return success_response(TokenResponse(**tokens))


@router.post("/logout", response_model=APIResponse[MessageResponse], status_code=status.HTTP_200_OK)
async def logout(
    token: str = Depends(oauth2_scheme)
):
    """
    Logout the user.
    """
    await AuthService.logout_user(token)
    return success_response(MessageResponse(message="Successfully logged out"))
