"""adding_decision_maker_position_in_work

Revision ID: 9ab303c99132
Revises: e9e70bb23624
Create Date: 2023-10-16 20:15:56.572347

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9ab303c99132'
down_revision = 'e9e70bb23624'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.add_column(sa.Column('decision_maker_position_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'positions', ['decision_maker_position_id'], ['id'])

    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('decision_maker_position_id', sa.Integer(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key(None, 'positions', ['decision_maker_position_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('decision_maker_position_id')

    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('decision_maker_position_id')

    # ### end Alembic commands ###
