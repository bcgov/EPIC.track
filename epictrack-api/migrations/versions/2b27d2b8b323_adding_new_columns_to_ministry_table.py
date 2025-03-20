"""adding_new_columns_to_ministry_table

Revision ID: 2b27d2b8b323
Revises: 1a2b3c4d5e6f
Create Date: 2025-03-06 16:43:25.184999

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2b27d2b8b323'
down_revision = '1a2b3c4d5e6f'
branch_labels = None
depends_on = None


def upgrade():
    """Add date_created and date_closed columns to ministries table."""
    op.add_column('ministries', sa.Column('date_created', sa.DateTime(timezone=True), nullable=True))
    op.add_column('ministries', sa.Column('date_closed', sa.DateTime(timezone=True), nullable=True))

    op.add_column('ministries_history', sa.Column('date_created', sa.DateTime(timezone=True), nullable=True))
    op.add_column('ministries_history', sa.Column('date_closed', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    """Remove date_created and date_closed columns from ministries table."""
    op.drop_column('ministries', 'date_created')
    op.drop_column('ministries', 'date_closed')

    op.drop_column('ministries_history', 'date_created')
    op.drop_column('ministries_history', 'date_closed')
