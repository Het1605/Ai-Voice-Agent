"""
Purpose: Main API router connecting all version 1 endpoints.
"""

from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, users, organizations, agents

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(agents.router, prefix="/organizations/{org_id}/agents", tags=["agents"])
