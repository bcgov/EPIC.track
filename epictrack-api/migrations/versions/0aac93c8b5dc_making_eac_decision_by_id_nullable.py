"""making eac_decision_by_id nullable

Revision ID: 0aac93c8b5dc
Revises: 6123cb7fe99c
Create Date: 2023-04-19 13:20:53.499127

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0aac93c8b5dc'
down_revision = '6123cb7fe99c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('eac_decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('eac_decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    # ### end Alembic commands ###
