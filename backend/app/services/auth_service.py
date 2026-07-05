"""
Purpose: Business logic for Authentication.
Responsibilities:
  - User registration.
  - User authentication (login).
  - Token generation.
  - Current user retrieval from token.
  - User status verification.
Architecture Fit:
  - Sits between the API endpoints and the database layer.
  - Uses the security and JWT core utilities.
"""

from typing import Dict, Any
from datetime import datetime, timezone
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.core.security import get_password_hash, verify_password
from backend.app.core.jwt_service import create_access_token, create_refresh_token, verify_token
from backend.app.core.exceptions import UnauthorizedException, BadRequestException, NotFoundException


class AuthService:
    
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        """Helper to get a user by their email address."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
        """Helper to get a user by their ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    def verify_user_status(user: User) -> None:
        """
        Verifies if the user is allowed to log in or perform actions.
        Raises UnauthorizedException if the user is inactive or locked.
        """
        if not user.is_active:
            raise UnauthorizedException(detail="Inactive user account")
            
        if user.account_locked_until:
            if user.account_locked_until > datetime.now(timezone.utc):
                raise UnauthorizedException(detail="Account is temporarily locked")
            # If the lock time has passed, we could optionally reset it here.
            # But we'll leave that for the login flow to handle.

    @classmethod
    async def register_user(cls, db: AsyncSession, user_in: UserCreate) -> User:
        """
        Registers a new user after verifying the email is unique.
        """
        existing_user = await cls.get_user_by_email(db, email=user_in.email)
        if existing_user:
            raise BadRequestException(detail="A user with this email already exists")

        # Create new user, hashing the password
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            is_active=user_in.is_active,
            is_verified=False  # Requires explicit verification step later
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        return db_user

    @classmethod
    async def authenticate_user(cls, db: AsyncSession, email: str, password: str) -> User:
        """
        Authenticates a user via email and password.
        Updates last_login_at or failed_login_attempts.
        """
        user = await cls.get_user_by_email(db, email)
        if not user:
            raise UnauthorizedException(detail="Incorrect email or password")
            
        # Check if the account is allowed to log in
        cls.verify_user_status(user)
        
        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            # Simple lockout policy could be added here (e.g., if > 5 lock account)
            await db.commit()
            raise UnauthorizedException(detail="Incorrect email or password")
            
        # Successful login: reset failed attempts and update last login time
        user.failed_login_attempts = 0
        user.last_login_at = datetime.now(timezone.utc)
        user.account_locked_until = None
        
        await db.commit()
        await db.refresh(user)
        
        return user

    @staticmethod
    def generate_tokens(user: User) -> Dict[str, str]:
        """
        Generates access and refresh tokens for a given user.
        """
        return {
            "access_token": create_access_token(subject=user.id),
            "refresh_token": create_refresh_token(subject=user.id),
            "token_type": "bearer"
        }

    @classmethod
    async def get_current_user(cls, db: AsyncSession, token: str) -> User:
        """
        Extracts user from token and verifies they exist and are active.
        """
        payload = verify_token(token, expected_type="access")
        user_id_str = payload.get("sub")
        
        if not user_id_str:
            raise UnauthorizedException(detail="Token payload missing subject identifier")
            
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise UnauthorizedException(detail="Invalid subject identifier format")
            
        user = await cls.get_user_by_id(db, user_id)
        
        if not user:
            raise UnauthorizedException(detail="User not found")
            
        # Ensure user is still active and not locked
        cls.verify_user_status(user)
        
        return user

    @classmethod
    async def refresh_access_token(cls, db: AsyncSession, refresh_token: str) -> Dict[str, str]:
        """
        Validates the refresh token and returns a new access token.
        (Also issues a new refresh token to implement token rotation).
        """
        # verify_token will throw UnauthorizedException if it's invalid/expired/not a refresh token
        payload = verify_token(refresh_token, expected_type="refresh")
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException(detail="Token payload missing subject identifier")
            
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise UnauthorizedException(detail="Invalid subject identifier format")
            
        user = await cls.get_user_by_id(db, user_id)
        if not user:
            raise UnauthorizedException(detail="User not found")
            
        cls.verify_user_status(user)
        
        # Return new set of tokens (Token Rotation)
        return cls.generate_tokens(user)

    @classmethod
    async def logout_user(cls, token: str) -> None:
        """
        Handles the logout flow.
        Currently a no-op for stateless JWTs.
        Designed to support future session invalidation or token blacklisting 
        (e.g., adding the token signature to Redis) without changing the API contract.
        """
        # Future architecture: 
        # 1. Decode token to get expiration.
        # 2. Add token signature to Redis blacklist with TTL = time_until_expiration.
        # 3. verify_token() would check Redis to ensure token isn't blacklisted.
        pass
