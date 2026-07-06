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

from backend.app.models.organization import Organization
from backend.app.schemas.organization import OrganizationCreate, OrganizationUpdate
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
