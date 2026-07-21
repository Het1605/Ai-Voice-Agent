"""
Purpose: Reusable dependency injection providers for authentication and RBAC.
Responsibilities:
  - Extracts the current user from the JWT token.
  - Verifies if the user has the required roles to access an endpoint.
Architecture Fit:
  - Used directly in FastAPI route definitions via the Depends() mechanism.
"""

from typing import List
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import get_db_session
from backend.app.core.config import settings
from backend.app.core.exceptions import UnauthorizedException
from backend.app.domain.users.models import User, SystemRole
from backend.app.domain.identity.services.service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Dependency that returns the current authenticated and active user.
    Throws an UnauthorizedException if the token is invalid or the user is inactive.
    """
    return await AuthService.get_current_user(db, token)


class RequireRole:
    """
    Dependency generator for Role-Based Access Control (RBAC).
    Usage:
        @router.get("/admin-only", dependencies=[Depends(RequireRole([SystemRole.ADMIN]))])
    """
    def __init__(self, allowed_roles: List[SystemRole]):
        self.allowed_roles = [role.value for role in allowed_roles]

    async def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        """
        Verifies the user's role against the allowed roles.
        """
        # Super Admins always have access to everything
        if current_user.role == SystemRole.SUPER_ADMIN.value:
            return current_user
            
        if current_user.role not in self.allowed_roles:
            raise UnauthorizedException(detail="You do not have permission to access this resource")
            
        return current_user
