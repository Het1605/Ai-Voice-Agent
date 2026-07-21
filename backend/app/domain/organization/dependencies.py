from typing import List, Optional
import uuid

from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.domain.identity.dependencies import get_current_active_user
from backend.app.infrastructure.database.session import get_db
from backend.app.domain.users.models import User
from backend.app.domain.organization.models import OrganizationMember, OrganizationRole

class RequireOrgRole:
    """
    FastAPI Dependency to enforce Organization-level Role-Based Access Control (RBAC).
    Extracts org_id from path params, checks if the user is a member, and validates their role.
    """
    def __init__(self, allowed_roles: List[OrganizationRole]):
        self.allowed_roles = allowed_roles

    async def __call__(
        self, 
        request: Request,
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
    ) -> OrganizationMember:
        
        # 1. Extract org_id from URL path variables
        org_id_str = request.path_params.get("org_id")
        if not org_id_str:
            # If org_id is not in path, this dependency was used incorrectly
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="org_id path parameter is missing in the route."
            )
            
        try:
            org_id = uuid.UUID(org_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid org_id format."
            )

        # 2. Check membership and role
        result = await db.execute(
            select(OrganizationMember)
            .where(OrganizationMember.user_id == current_user.id)
            .where(OrganizationMember.organization_id == org_id)
        )
        member = result.scalars().first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this organization."
            )

        if member.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required one of: {[r.value for r in self.allowed_roles]}"
            )

        # 3. Return the member object in case the endpoint needs it
        return member
