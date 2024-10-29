"""project state changes

Revision ID: 06f9e87c2f4b
Revises: 2231da27b689
Create Date: 2023-11-21 14:51:06.115647

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '06f9e87c2f4b'
down_revision = '2231da27b689'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE projectstateenum ADD VALUE 'PRE_WORK'")
    op.execute("COMMIT")
    with op.batch_alter_table('projects_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_state', sa.Enum('PRE_WORK', 'UNDER_EAC_ASSESSMENT', 'UNDER_EXEMPTION_REQUEST', 'UNDER_AMENDMENT', 'UNDER_DISPUTE_RESOLUTION', 'PRE_CONSTRUCTION', 'CONSTRUCTION', 'OPERATION', 'CARE_AND_MAINTENANCE', 'DECOMMISSION', 'UNKNOWN', 'CLOSED', 'UNDER_DESIGNATION', name='projectstateenum'), autoincrement=False, nullable=True))
    # ### end Alembic commands ###



def downgrade():
     with op.batch_alter_table('projects_history', schema=None) as batch_op:
        batch_op.drop_column('project_state')
