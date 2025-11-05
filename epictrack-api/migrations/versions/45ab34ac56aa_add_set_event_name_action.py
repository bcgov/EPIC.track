"""add SetEventName action

Revision ID: 45ab34ac56aa
Revises: 37f6dd08d165
Create Date: 2025-09-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "45ab34ac56aa"
down_revision = "37f6dd08d165"
branch_labels = None
depends_on = None


def upgrade():
    actions_table = sa.table(
        "actions",
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )

    op.bulk_insert(
        actions_table,
        [
            {
                "name": "SetEventName",
                "description": "Sets the event name",
            }
        ],
    )


def downgrade():
    op.execute("DELETE FROM actions WHERE name='SetEventName'")
