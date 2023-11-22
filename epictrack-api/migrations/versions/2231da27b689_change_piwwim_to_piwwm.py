"""change PIWWIM to PIWWM

Revision ID: 2231da27b689
Revises: 1d3c34a30cfb
Create Date: 2023-11-21 10:13:28.507868

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2231da27b689'
down_revision = '1d3c34a30cfb'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update eao_teams set name='PIWWM' where name='PIWWIM'")


def downgrade():
    pass
