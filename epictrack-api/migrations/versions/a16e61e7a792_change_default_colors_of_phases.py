"""change default colors of phases

Revision ID: a16e61e7a792
Revises: 163c26a2cc89
Create Date: 2023-12-06 11:38:13.307535

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a16e61e7a792'
down_revision = '163c26a2cc89'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update phase_codes set color='#003366' where color='#FFFFFF'")


def downgrade():
    pass
