"""project lead to team lead

Revision ID: 7a42d4f57279
Revises: 1e1a2af1605b
Create Date: 2023-11-24 13:39:01.142953

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a42d4f57279'
down_revision = '1e1a2af1605b'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update roles set name='Team Lead' where name='Project Lead'")


def downgrade():
    pass
