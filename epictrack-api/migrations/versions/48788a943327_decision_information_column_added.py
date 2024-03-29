"""decision_information column added

Revision ID: 48788a943327
Revises: 6fd78c6511a4
Create Date: 2023-04-05 18:31:31.495254

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '48788a943327'
down_revision = '6fd78c6511a4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('events', sa.Column('decision_information', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('events', 'decision_information')
    # ### end Alembic commands ###
