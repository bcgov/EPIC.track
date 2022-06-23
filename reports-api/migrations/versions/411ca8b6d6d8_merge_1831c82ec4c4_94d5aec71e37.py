"""merge 1831c82ec4c4 & 94d5aec71e37

Revision ID: 411ca8b6d6d8
Revises: 94d5aec71e37, 1831c82ec4c4
Create Date: 2022-06-17 16:58:36.033152

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '411ca8b6d6d8'
down_revision = ('94d5aec71e37', '1831c82ec4c4')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
