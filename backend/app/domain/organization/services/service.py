"""
Purpose: Business logic for Organizations.
Responsibilities:
  - Create, read, update organizations.
  - Activate/Deactivate organizations.
  - Enforce business rules (e.g. unique names).
Architecture Fit:
  - Sits between the API endpoints and the database layer.
  - Independent from HTTP requests/responses.
"""

from typing import Optional, List
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.domain.organization.models import Organization
from backend.app.domain.organization.schemas import OrganizationCreate, OrganizationUpdate
from backend.app.core.exceptions import NotFoundException, ConflictException

class OrganizationService:
    
    @staticmethod
    async def list_organizations(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Organization]:
        """Fetch a paginated list of organizations."""
        result = await db.execute(select(Organization).offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_organization_by_name(db: AsyncSession, name: str) -> Optional[Organization]:
        """Fetch an organization by exact name."""
        result = await db.execute(select(Organization).where(Organization.name == name))
        return result.scalars().first()

    @staticmethod
    async def get_organization(db: AsyncSession, org_id: uuid.UUID) -> Organization:
        """
        Fetch an organization by ID.
        Raises NotFoundException if it doesn't exist.
        """
        result = await db.execute(select(Organization).where(Organization.id == org_id))
        org = result.scalars().first()
        if not org:
            raise NotFoundException(detail="Organization not found.")
        return org

    @staticmethod
    async def create_organization(db: AsyncSession, org_in: OrganizationCreate) -> Organization:
        """
        Create a new organization.
        Enforces unique organization names.
        """
        existing_org = await OrganizationService.get_organization_by_name(db, org_in.name)
        if existing_org:
            raise ConflictException(detail="An organization with this name already exists.")

        org = Organization(
            name=org_in.name,
            is_active=org_in.is_active
        )
        
        db.add(org)
        await db.commit()
        await db.refresh(org)
        
        return org

    @staticmethod
    async def update_organization(db: AsyncSession, org_id: uuid.UUID, org_in: OrganizationUpdate) -> Organization:
        """
        Update an existing organization's basic details.
        Raises NotFoundException if it doesn't exist.
        """
        org = await OrganizationService.get_organization(db, org_id)

        if org_in.name is not None and org_in.name != org.name:
            # Check for name collisions
            existing_org = await OrganizationService.get_organization_by_name(db, org_in.name)
            if existing_org:
                raise ConflictException(detail="An organization with this name already exists.")
            org.name = org_in.name

        if org_in.is_active is not None:
            org.is_active = org_in.is_active

        await db.commit()
        await db.refresh(org)
        
        return org

    @staticmethod
    async def activate_organization(db: AsyncSession, org_id: uuid.UUID) -> Organization:
        """Activate a suspended organization."""
        org = await OrganizationService.get_organization(db, org_id)
        org.is_active = True
        await db.commit()
        await db.refresh(org)
        return org

    @staticmethod
    async def deactivate_organization(db: AsyncSession, org_id: uuid.UUID) -> Organization:
        """
        Suspend an organization. 
        This should cascade to prevent user access in future modules.
        """
        org = await OrganizationService.get_organization(db, org_id)
        org.is_active = False
        await db.commit()
        await db.refresh(org)
        return org
"""
Purpose: Business logic for Organization Membership.
Responsibilities:
  - Add/Remove users to/from organizations.
  - List members of an organization.
  - List organizations a user belongs to.
Architecture Fit:
  - Connects User and Organization domains without mingling them directly.
"""

import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.domain.organization.models import OrganizationMember, OrganizationRole
from backend.app.domain.users.models import User
from backend.app.domain.organization.models import Organization
from backend.app.core.exceptions import NotFoundException, ConflictException, UnauthorizedException
from backend.app.domain.identity.services.service import AuthService
from backend.app.domain.organization.services.service import OrganizationService

class OrganizationMemberService:

    @staticmethod
    async def add_member(db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID, role: OrganizationRole = OrganizationRole.MEMBER) -> OrganizationMember:
        """
        Adds a user to an organization with a specific role.
        Validates both exist and prevents duplicates.
        """
        # 1. Validate User exists
        user = await AuthService.get_user_by_id(db, user_id)
        if not user:
            raise NotFoundException(detail="User not found.")

        # 2. Validate Organization exists
        org = await OrganizationService.get_organization(db, org_id)

        # 3. Check for existing membership
        existing = await db.execute(
            select(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
            .where(OrganizationMember.organization_id == org_id)
        )
        if existing.scalars().first():
            raise ConflictException(detail="User is already a member of this organization.")

        # 4. Create membership
        member = OrganizationMember(user_id=user_id, organization_id=org_id, role=role)
        db.add(member)
        await db.commit()
        await db.refresh(member)
        return member

    @staticmethod
    async def update_member_role(db: AsyncSession, target_user_id: uuid.UUID, org_id: uuid.UUID, new_role: OrganizationRole, current_user_id: uuid.UUID) -> OrganizationMember:
        """
        Updates a member's role. Enforces business rules:
        - Cannot modify the sole owner without transferring.
        - Only owners can grant owner status.
        """
        # Get target member
        target_member_result = await db.execute(
            select(OrganizationMember).where(OrganizationMember.user_id == target_user_id).where(OrganizationMember.organization_id == org_id)
        )
        target_member = target_member_result.scalars().first()
        if not target_member:
            raise NotFoundException(detail="Target user is not a member of this organization.")

        # Get current user member (the actor)
        current_member_result = await db.execute(
            select(OrganizationMember).where(OrganizationMember.user_id == current_user_id).where(OrganizationMember.organization_id == org_id)
        )
        current_member = current_member_result.scalars().first()
        if not current_member:
            raise UnauthorizedException(detail="You are not a member of this organization.")
            
        if current_member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise UnauthorizedException(detail="Only owners and admins can manage roles.")

        # Rule 1: Only OWNER can grant or revoke OWNER status
        if new_role == OrganizationRole.OWNER or target_member.role == OrganizationRole.OWNER:
            if current_member.role != OrganizationRole.OWNER:
                raise UnauthorizedException(detail="Only an owner can grant or revoke ownership.")
                
        # Rule 2: Cannot demote yourself if you are the only OWNER
        if target_user_id == current_user_id and target_member.role == OrganizationRole.OWNER and new_role != OrganizationRole.OWNER:
            # Check if there's another owner
            other_owners_result = await db.execute(
                select(OrganizationMember).where(OrganizationMember.organization_id == org_id).where(OrganizationMember.role == OrganizationRole.OWNER).where(OrganizationMember.user_id != current_user_id)
            )
            if not other_owners_result.scalars().first():
                raise ConflictException(detail="Cannot demote the only owner. Transfer ownership first.")

        target_member.role = new_role
        await db.commit()
        await db.refresh(target_member)
        return target_member

    @staticmethod
    async def remove_member(db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID) -> None:
        """
        Removes a user from an organization.
        Raises NotFoundException if membership does not exist.
        """
        existing = await db.execute(
            select(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
            .where(OrganizationMember.organization_id == org_id)
        )
        member = existing.scalars().first()
        
        if not member:
            raise NotFoundException(detail="Membership not found.")

        await db.delete(member)
        await db.commit()

    @staticmethod
    async def list_organization_members(db: AsyncSession, org_id: uuid.UUID) -> List[OrganizationMember]:
        """
        Returns all memberships for a specific organization.
        """
        # Validate org exists
        await OrganizationService.get_organization(db, org_id)
        
        result = await db.execute(
            select(OrganizationMember).where(OrganizationMember.organization_id == org_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_user_organizations(db: AsyncSession, user_id: uuid.UUID) -> List[OrganizationMember]:
        """
        Returns all memberships for a specific user.
        """
        # Validate user exists
        user = await AuthService.get_user_by_id(db, user_id)
        if not user:
            raise NotFoundException(detail="User not found.")

        result = await db.execute(
            select(OrganizationMember)
            .options(selectinload(OrganizationMember.organization))
            .where(OrganizationMember.user_id == user_id)
        )
        return list(result.scalars().all())
