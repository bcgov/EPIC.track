"""add is_resolved to work_issues

Revision ID: 09fb62ec79e9
Revises: af4022c1a70c
Create Date: 2024-11-29 16:29:02.770899

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '09fb62ec79e9'
down_revision = 'af4022c1a70c'
branch_labels = None
depends_on = None


def upgrade():

    with op.batch_alter_table('work_issues', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default=sa.false()))

    with op.batch_alter_table('work_issues_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_resolved', sa.Boolean(), autoincrement=False, nullable=False, server_default=sa.false()))


def downgrade():

    with op.batch_alter_table('work_issues_history', schema=None) as batch_op:
        batch_op.drop_column('is_resolved')

    with op.batch_alter_table('work_issues', schema=None) as batch_op:
        batch_op.drop_column('is_resolved')
