"""add new values into special field entity enum

Revision ID: 9e037c3e04c6
Revises: af98a57c56a4
Create Date: 2025-02-04 22:15:54.314492

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9e037c3e04c6'
down_revision = 'af98a57c56a4'
branch_labels = None
depends_on = None


def upgrade():
    # update entity enum
    op.execute("ALTER TYPE entityenum ADD VALUE IF NOT EXISTS 'ISSUE'")


def downgrade():
    pass
