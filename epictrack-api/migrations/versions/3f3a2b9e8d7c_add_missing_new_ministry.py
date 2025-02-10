"""add missing new ministry

Revision ID: 3f3a2b9e8d7c
Revises: eccbb8b96011
Create Date: 2025-01-04 09:19:17.743999

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3f3a2b9e8d7c'
down_revision = 'eccbb8b96011'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE ministries SET sort_order = sort_order + 1 WHERE sort_order >= 9")
    op.execute("INSERT INTO ministries (name, abbreviation, sort_order) VALUES ('Energy and Climate Solutions', 'ECS', 9)")


def downgrade():
    op.execute("DELETE FROM ministries WHERE name = 'Energy and Climate Solutions'")
    op.execute("UPDATE ministries SET sort_order = sort_order - 1 WHERE sort_order > 9")
