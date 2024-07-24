"""Merge heads fix

Revision ID: e6b5f83b6bf3
Revises: 19227722dffc, 87cef5c064d8
Create Date: 2024-07-24 14:40:59.023275

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6b5f83b6bf3'
down_revision = ('19227722dffc', '87cef5c064d8')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
