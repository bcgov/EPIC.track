"""rename work_status to work_statuses

Revision ID: f2cde86da016
Revises: a5d5c1263bce
Create Date: 2022-03-04 18:06:12.797514

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2cde86da016'
down_revision = 'a5d5c1263bce'
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table('work_status', 'work_statuses')
    op.execute('ALTER SEQUENCE work_status_id_seq RENAME TO work_statuses_id_seq')
    op.execute('ALTER INDEX work_status_pkey RENAME TO work_statuses_pkey')


def downgrade():
    op.rename_table('work_statuses', 'work_status')
    op.execute('ALTER SEQUENCE work_statuses_id_seq RENAME TO work_status_id_seq')
    op.execute('ALTER INDEX work_statuses_pkey RENAME TO work_status_pkey')
