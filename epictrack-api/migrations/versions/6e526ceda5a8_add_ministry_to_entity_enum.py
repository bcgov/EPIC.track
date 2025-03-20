"""add ministry to entity enum

Revision ID: 6e526ceda5a8
Revises: 2b27d2b8b323
Create Date: 2025-03-18 17:26:05.163181

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6e526ceda5a8'
down_revision = '2b27d2b8b323'
branch_labels = None
depends_on = None


def upgrade():
    # update entity enum
    op.execute("ALTER TYPE entityenum ADD VALUE IF NOT EXISTS 'MINISTRY'")


def downgrade():
    pass