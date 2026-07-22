from typing import List
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.domain.organization.schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.domain.organization.schemas import OrganizationMemberResponse, OrganizationMemberWithOrgResponse
from app.domain.organization.services.service import OrganizationService
from app.domain.organization.services.service import OrganizationMemberService
from app.domain.users.models import User, SystemRole
from app.domain.organization.models import OrganizationRole
from app.domain.identity.dependencies import RequireRole, get_current_active_user
from app.domain.organization.dependencies import RequireOrgRole

router = APIRouter()

_super_admin_deps = [Depends(RequireRole([SystemRole.SUPER_ADMIN]))]
_any_user_deps = [Depends(get_current_active_user)]

@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new organization and assign the creator as the OWNER.
    """
    org = await OrganizationService.create_organization(db, org_in)
    await OrganizationMemberService.add_member(db, user_id=current_user.id, org_id=org.id, role=OrganizationRole.OWNER)
    return org

@router.get("/me", response_model=List[OrganizationMemberWithOrgResponse])
async def get_my_organizations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all organizations the current user is a member of.
    """
    return await OrganizationMemberService.list_user_organizations(db, user_id=current_user.id)

@router.get("", response_model=List[OrganizationResponse], dependencies=_super_admin_deps)
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List all organizations (Super Admin only).
    """
    return await OrganizationService.list_organizations(db, skip=skip, limit=limit)

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    org_member=Depends(RequireOrgRole([OrganizationRole.OWNER, OrganizationRole.ADMIN, OrganizationRole.MEMBER]))
):
    """
    Get organization details. Requires membership.
    """
    return await OrganizationService.get_organization(db, org_id)

@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: uuid.UUID,
    org_in: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    org_member=Depends(RequireOrgRole([OrganizationRole.OWNER, OrganizationRole.ADMIN]))
):
    """
    Update an organization's details. Requires Owner or Admin role.
    """
    return await OrganizationService.update_organization(db, org_id, org_in)

@router.get("/{org_id}/members", response_model=List[OrganizationMemberResponse])
async def list_organization_members(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    org_member=Depends(RequireOrgRole([OrganizationRole.OWNER, OrganizationRole.ADMIN, OrganizationRole.MEMBER]))
):
    """
    List all members in the organization. Requires membership.
    """
    return await OrganizationMemberService.list_organization_members(db, org_id)

@router.post("/{org_id}/activate", response_model=OrganizationResponse, dependencies=_super_admin_deps)
async def activate_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Activate an organization (Super Admin only).
    """
    return await OrganizationService.activate_organization(db, org_id)

@router.post("/{org_id}/deactivate", response_model=OrganizationResponse, dependencies=_super_admin_deps)
async def deactivate_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate an organization (Super Admin only).
    """
    return await OrganizationService.deactivate_organization(db, org_id)
