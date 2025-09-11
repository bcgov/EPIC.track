"""Create work resources table

Revision ID: 37f6dd08d165
Revises: 99af45bef1a1
Create Date: 2025-09-09 16:00:48.526693

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '37f6dd08d165'
down_revision = '99af45bef1a1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'work_resources',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('link', sa.Text(), nullable=False),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id'), nullable=False),
        sa.Column('created_by', sa.String(255), nullable=True, default=None),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_by', sa.String(255), nullable=True, default=None),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )

    op.create_table(
        'work_resources_history',
        sa.Column('pk', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('link', sa.Text(), nullable=False),
        sa.Column('work_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.String(255), nullable=True, default=None),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_by', sa.String(255), nullable=True, default=None),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=False)
    )

def downgrade():
    op.drop_table('work_resources')
    op.drop_table('work_resources_history')