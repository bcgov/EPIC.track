"""add new milestone types

Revision ID: b565204660f7
Revises: c91a2375e5b1
Create Date: 2022-07-12 11:05:39.000807

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import column,table



# revision identifiers, used by Alembic.
revision = 'b565204660f7'
down_revision = 'c91a2375e5b1'
branch_labels = None
depends_on = None


def upgrade():
    milestone_types = table('milestone_types',
        column('id',sa.Integer),
        column('name', sa.String),
    )

    op.bulk_insert(
        milestone_types,
        [
            {
                "name": "Extension"
            },
            {
                "name": "Suspension"
            }
        ]
    )


def downgrade():
    op.execute("DELETE FROM milestone_types WHERE name in ('Extension', 'Suspension')")
