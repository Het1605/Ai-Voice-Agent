"""
Purpose: Main API router connecting all version 1 endpoints.
"""

from fastapi import APIRouter
from backend.app.modules.auth.router import router as auth_router
from backend.app.modules.users.router import router as users_router
from backend.app.modules.organizations.router import router as organizations_router
from backend.app.modules.agents.router import router as agents_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(organizations_router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(agents_router, prefix="/organizations/{org_id}/agents", tags=["Agents"])
