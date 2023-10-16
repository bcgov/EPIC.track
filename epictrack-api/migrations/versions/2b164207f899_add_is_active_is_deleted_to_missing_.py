"""add is_active is_deleted to missing tables

Revision ID: 2b164207f899
Revises: 11a3360d6a01
Create Date: 2023-02-01 11:18:24.102416

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b164207f899'
down_revision = '11a3360d6a01'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('engagements', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('indigenous_works', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('inspection_attachments', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('inspection_attendees', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('inspection_details', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('inspections', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('staff_work_roles', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('work_phases', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('work_engagements', sa.Column('is_active', sa.Boolean(), server_default='t', nullable=True))
    op.add_column('work_engagements', sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=True))


def downgrade():
    op.drop_column('engagements', 'is_active')
    op.drop_column('indigenous_works', 'is_active')
    op.drop_column('inspection_attachments', 'is_active')
    op.drop_column('inspection_attendees', 'is_active')
    op.drop_column('inspection_details', 'is_active')
    op.drop_column('inspections', 'is_active')
    op.drop_column('staff_work_roles', 'is_active')
    op.drop_column('work_phases', 'is_active')
    op.drop_column('work_engagements', 'is_active')
    op.drop_column('work_engagements', 'is_deleted')
