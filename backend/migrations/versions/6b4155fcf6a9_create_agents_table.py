"""create_agents_table

Revision ID: 6b4155fcf6a9
Revises: a136acf34cb6
Create Date: 2026-07-21 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6b4155fcf6a9"
down_revision: Union[str, Sequence[str], None] = "a136acf34cb6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the agents table."""
    op.create_table(
        "agents",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False, index=True),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("default_language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("organization_id", sa.UUID(), nullable=False, index=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agents_id"), "agents", ["id"], unique=False)
    op.create_index(op.f("ix_agents_name"), "agents", ["name"], unique=False)
    op.create_index(op.f("ix_agents_organization_id"), "agents", ["organization_id"], unique=False)


def downgrade() -> None:
    """Drop the agents table."""
    op.drop_index(op.f("ix_agents_organization_id"), table_name="agents")
    op.drop_index(op.f("ix_agents_name"), table_name="agents")
    op.drop_index(op.f("ix_agents_id"), table_name="agents")
    op.drop_table("agents")
