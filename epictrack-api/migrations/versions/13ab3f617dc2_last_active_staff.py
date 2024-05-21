"""last active date staff

Revision ID: 13ab3f617dc2
Revises: b724615d3fdf
Create Date: 2024-05-15 12:25:09.283687

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '13ab3f617dc2'
down_revision = 'b724615d3fdf'
branch_labels = None
depends_on = None


def upgrade():
    # Add the new column
    op.add_column('staffs', sa.Column('last_active_at', sa.DateTime(), nullable=True))
    op.add_column('staffs_history', sa.Column('last_active_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove the column if needed
    op.drop_column('staffs', 'last_active_at')
    op.drop_column('staffs_history', 'last_active_at')

