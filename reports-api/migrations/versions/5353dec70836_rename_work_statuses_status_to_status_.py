"""rename work_statuses.status to status_text

Revision ID: 5353dec70836
Revises: cc3b6f02f161
Create Date: 2022-12-26 09:16:54.785142

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5353dec70836'
down_revision = 'cc3b6f02f161'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('work_statuses', sa.Column('status_text', sa.String(length=255), nullable=False))
    op.drop_column('work_statuses', 'status')


def downgrade():
    op.add_column('work_statuses', sa.Column('status', sa.VARCHAR(length=255), autoincrement=False, nullable=False))
    op.drop_column('work_statuses', 'status_text')
