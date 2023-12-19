"""text change O&G to OGI

Revision ID: 925ba8974e38
Revises: a16e61e7a792
Create Date: 2023-12-18 09:56:39.229174

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '925ba8974e38'
down_revision = 'a16e61e7a792'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update eao_teams set name='OGI' where name='O&G'")


def downgrade():
    pass
