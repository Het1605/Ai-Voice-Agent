import uuid
from typing import List

from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from backend.app.services.agent_service import AgentService
from backend.app.models.user import User
from backend.app.models.organization_member import OrganizationRole, OrganizationMember
from backend.app.core.auth_deps import get_current_active_user
from backend.app.core.org_auth_deps import RequireOrgRole

router = APIRouter()

# Dependency lists for roles
_owner_or_admin = [Depends(RequireOrgRole([OrganizationRole.OWNER, OrganizationRole.ADMIN]))]
_any_member = [Depends(RequireOrgRole([OrganizationRole.OWNER, OrganizationRole.ADMIN, OrganizationRole.MEMBER]))]


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED, dependencies=_owner_or_admin)
async def create_agent(
    org_id: uuid.UUID = Path(..., description="Organization ID"),
    *,
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new AI Agent for the organization.
    Requires Owner or Admin role.
    """
    # Enforce that the body org_id matches the path org_id to prevent hijacking
    agent_in.organization_id = org_id
    return await AgentService.create_agent(db=db, obj_in=agent_in, user_id=current_user.id)


@router.get("", response_model=List[AgentResponse], dependencies=_any_member)
async def list_agents(
    org_id: uuid.UUID = Path(..., description="Organization ID"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List all AI Agents for an organization.
    Requires any member role.
    """
    return await AgentService.list_agents(db=db, organization_id=org_id, skip=skip, limit=limit)


@router.get("/{agent_id}", response_model=AgentResponse, dependencies=_any_member)
async def get_agent(
    org_id: uuid.UUID = Path(..., description="Organization ID"),
    agent_id: uuid.UUID = Path(..., description="Agent ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get an AI Agent by ID.
    Requires any member role.
    """
    # Note: We assume the agent belongs to org_id. If needed, we can validate this in the service or here.
    agent = await AgentService.get_agent_or_404(db=db, agent_id=agent_id)
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse, dependencies=_owner_or_admin)
async def update_agent(
    org_id: uuid.UUID = Path(..., description="Organization ID"),
    agent_id: uuid.UUID = Path(..., description="Agent ID"),
    *,
    agent_in: AgentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an AI Agent configuration.
    Requires Owner or Admin role.
    """
    return await AgentService.update_agent(db=db, agent_id=agent_id, obj_in=agent_in)


@router.delete("/{agent_id}", response_model=AgentResponse, dependencies=_owner_or_admin)
async def delete_agent(
    org_id: uuid.UUID = Path(..., description="Organization ID"),
    agent_id: uuid.UUID = Path(..., description="Agent ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete (deactivate) an AI Agent.
    Requires Owner or Admin role.
    """
    return await AgentService.delete_agent(db=db, agent_id=agent_id)
