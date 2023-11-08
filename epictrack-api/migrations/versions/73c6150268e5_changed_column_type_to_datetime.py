"""changed column type to datetime

Revision ID: 73c6150268e5
Revises: 8e4bb9cd046c
Create Date: 2023-11-08 09:44:54.419908

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '73c6150268e5'
down_revision = '8e4bb9cd046c'
branch_labels = None
depends_on = None


def upgrade():
    # Change the column type to DateTime with timezone
    op.alter_column('work_statuses', 'posted_date', type_=sa.DateTime(timezone=True))


def downgrade():
    # If needed, revert the column type change
    op.alter_column('work_statuses', 'posted_date', type_=sa.Date())
