"""more event fields

Revision ID: 7b4040c1af9a
Revises: bba88c6304c6
Create Date: 2023-10-05 14:13:36.948136

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7b4040c1af9a'
down_revision = 'bba88c6304c6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('number_of_responses', sa.Integer(), nullable=True))

    with op.batch_alter_table('events_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('number_of_responses', sa.Integer(), autoincrement=False, nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events_history', schema=None) as batch_op:
        batch_op.drop_column('number_of_responses')

    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_column('number_of_responses')

    # ### end Alembic commands ###
