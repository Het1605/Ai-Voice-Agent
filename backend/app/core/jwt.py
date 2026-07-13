"""
Purpose: JSON Web Token (JWT) management service.
Responsibilities:
  - Generates short-lived access tokens and long-lived refresh tokens.
  - Decodes and verifies incoming tokens.
Architecture Fit:
  - Agnostic of business logic; only handles cryptographic signing and verification.
  - Will be used by FastAPI dependency injection to authorize protected routes.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from backend.app.core.config import settings
from backend.app.core.exceptions import UnauthorizedException


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT access token for the given subject (usually User ID).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT refresh token for the given subject.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token.
    Raises custom UnauthorizedException if the token is invalid, expired, or of the wrong type.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        # Verify token type (to prevent using a refresh token as an access token)
        token_type = payload.get("type")
        if token_type != expected_type:
            raise UnauthorizedException(detail=f"Invalid token type. Expected {expected_type}")
            
        return payload
    except ExpiredSignatureError:
        raise UnauthorizedException(detail="Token has expired")
    except InvalidTokenError:
        raise UnauthorizedException(detail="Could not validate credentials")
