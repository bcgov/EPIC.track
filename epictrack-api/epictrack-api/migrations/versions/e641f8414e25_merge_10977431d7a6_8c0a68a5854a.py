"""merge 10977431d7a6 & 8c0a68a5854a

Revision ID: e641f8414e25
Revises: 10977431d7a6, 8c0a68a5854a
Create Date: 2023-05-30 20:09:18.640660

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e641f8414e25'
down_revision = ('10977431d7a6', '8c0a68a5854a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
