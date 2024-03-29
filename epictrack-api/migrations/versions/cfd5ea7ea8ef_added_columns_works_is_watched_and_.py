"""added columns works.is_watched and events.is_reportable

Revision ID: cfd5ea7ea8ef
Revises: 48788a943327
Create Date: 2023-04-06 12:26:13.220476

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cfd5ea7ea8ef'
down_revision = '48788a943327'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('events', sa.Column('is_reportable', sa.Boolean(), server_default='f', nullable=False))
    op.add_column('works', sa.Column('is_watched', sa.Boolean(), server_default='f', nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('works', 'is_watched')
    op.drop_column('events', 'is_reportable')
    # ### end Alembic commands ###
