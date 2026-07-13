import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.modules.agents.models import Agent
from backend.app.modules.organizations.models import Organization
from backend.app.modules.agents.schemas import AgentCreate, AgentUpdate
from backend.app.core.exceptions import NotFoundException, BadRequestException


class AgentService:
    @staticmethod
    async def create_agent(db: AsyncSession, obj_in: AgentCreate, user_id: uuid.UUID) -> Agent:
        """Create a new AI Agent for an organization."""
        # Validate that the organization exists
        org_result = await db.execute(select(Organization).where(Organization.id == obj_in.organization_id))
        if not org_result.scalars().first():
            raise NotFoundException(detail="Organization not found")

        # Validate agent name uniqueness within the organization
        existing_agent = await db.execute(
            select(Agent).where(
                Agent.organization_id == obj_in.organization_id,
                Agent.name == obj_in.name
            )
        )
        if existing_agent.scalars().first():
            raise BadRequestException(detail="An agent with this name already exists in the organization")

        db_obj = Agent(
            name=obj_in.name,
            description=obj_in.description,
            is_active=obj_in.is_active,
            default_language=obj_in.default_language,
            system_prompt=obj_in.system_prompt,
            organization_id=obj_in.organization_id,
            created_by_id=user_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def get_agent(db: AsyncSession, agent_id: uuid.UUID) -> Optional[Agent]:
        """Get an AI Agent by ID."""
        result = await db.execute(select(Agent).where(Agent.id == agent_id))
        return result.scalars().first()

    @staticmethod
    async def get_agent_or_404(db: AsyncSession, agent_id: uuid.UUID) -> Agent:
        """Get an AI Agent by ID or raise 404."""
        agent = await AgentService.get_agent(db, agent_id)
        if not agent:
            raise NotFoundException(detail="Agent not found")
        return agent

    @staticmethod
    async def list_agents(db: AsyncSession, organization_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Agent]:
        """List all AI Agents for an organization."""
        result = await db.execute(
            select(Agent)
            .where(Agent.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_agent(db: AsyncSession, agent_id: uuid.UUID, obj_in: AgentUpdate) -> Agent:
        """Update an AI Agent."""
        agent = await AgentService.get_agent_or_404(db, agent_id)

        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Check name uniqueness if name is being updated
        if "name" in update_data and update_data["name"] != agent.name:
            existing_agent = await db.execute(
                select(Agent).where(
                    Agent.organization_id == agent.organization_id,
                    Agent.name == update_data["name"]
                )
            )
            if existing_agent.scalars().first():
                raise BadRequestException(detail="An agent with this name already exists in the organization")

        for field, value in update_data.items():
            setattr(agent, field, value)

        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent

    @staticmethod
    async def delete_agent(db: AsyncSession, agent_id: uuid.UUID) -> Agent:
        """Soft delete (or deactivate) an AI Agent. We will deactivate it for safety instead of hard delete."""
        agent = await AgentService.get_agent_or_404(db, agent_id)
        
        # Prevent operation on already deleted/inactive agents
        if not agent.is_active:
            raise BadRequestException(detail="Agent is already inactive")
            
        agent.is_active = False
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent
