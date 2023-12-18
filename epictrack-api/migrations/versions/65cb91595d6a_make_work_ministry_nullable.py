"""make work ministry nullable

Revision ID: 65cb91595d6a
Revises: 925ba8974e38
Create Date: 2023-12-18 14:57:36.523607

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '65cb91595d6a'
down_revision = '925ba8974e38'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('works', 'ministry_id', existing_type=sa.INTEGER(), nullable=True)
    op.alter_column('works_history', 'ministry_id', existing_type=sa.INTEGER(), nullable=True)


def downgrade():
    pass
