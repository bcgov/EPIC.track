"""rename work columns

Revision ID: 2257493941e7
Revises: 7deec389ae56
Create Date: 2023-10-23 16:12:30.470016

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2257493941e7'
down_revision = '7deec389ae56'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('short_description', new_column_name='report_description')
        batch_op.alter_column('long_description', new_column_name='epic_description')
        batch_op.alter_column('is_watched', new_column_name='is_high_priority')
        batch_op.drop_column('is_pecp_required')
    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('report_description', sa.String(length=2000), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('epic_description', sa.Text(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('is_high_priority', sa.Boolean(), autoincrement=False, nullable=False))
        batch_op.drop_column('is_watched')
        batch_op.drop_column('short_description')
        batch_op.drop_column('is_pecp_required')
        batch_op.drop_column('long_description')


def downgrade():
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('epic_description', new_column_name='long_description')
        batch_op.alter_column('report_description', new_column_name='short_description')
        batch_op.alter_column('is_high_priority', new_column_name='is_watched')
        batch_op.add_column(sa.Column('is_pecp_required', sa.Boolean(), nullable=False, default=False))
    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('long_description', sa.TEXT(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('is_pecp_required', sa.BOOLEAN(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('short_description', sa.VARCHAR(length=2000), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('is_watched', sa.BOOLEAN(), autoincrement=False, nullable=False))
        batch_op.drop_column('is_high_priority')
        batch_op.drop_column('epic_description')
        batch_op.drop_column('report_description')
