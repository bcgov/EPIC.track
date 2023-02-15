"""reminder_configurations_position_id

Revision ID: db1af3aa7e86
Revises: 27cdce23d103
Create Date: 2023-02-14 17:38:06.554888

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db1af3aa7e86'
down_revision = '27cdce23d103'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('reminder_configurations', sa.Column('position_id', sa.Integer(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('reminder_configurations', 'position_id')
    # ### end Alembic commands ###
