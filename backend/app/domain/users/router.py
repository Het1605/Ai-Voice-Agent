"""
Purpose: API endpoints for User management.
Responsibilities:
  - Demonstrates Role-Based Access Control (RBAC).
  - Exposes protected endpoints for retrieving user profiles.
Architecture Fit:
  - Mounted on the main FastAPI router.
"""

from fastapi import APIRouter, Depends
from backend.app.domain.users.models import User, SystemRole
from backend.app.domain.users.schemas import UserResponse
from backend.app.domain.identity.dependencies import get_current_active_user, RequireRole

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the currently logged-in user's profile.
    Available to any authenticated user (USER, ADMIN, SUPER_ADMIN).
    """
    return current_user


@router.get("/admin-only", response_model=UserResponse)
async def read_admin_data(
    current_user: User = Depends(RequireRole([SystemRole.ADMIN]))
):
    """
    Example protected endpoint.
    Available ONLY to ADMIN and SUPER_ADMIN roles.
    """
    # The RequireRole dependency handles the authorization check before this code runs.
    return current_user
