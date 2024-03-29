"""action and outcome configuration

Revision ID: 5547605183f6
Revises: 167e415cc6f6
Create Date: 2023-09-24 13:43:55.026985

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5547605183f6'
down_revision = '167e415cc6f6'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('TRUNCATE action_templates CASCADE')
    op.execute('TRUNCATE action_templates_history CASCADE')
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('action_templates', schema=None) as batch_op:
        batch_op.add_column(sa.Column('action_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(None, 'actions', ['action_id'], ['id'])
        batch_op.drop_column('name')

    with op.batch_alter_table('action_templates_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('action_id', sa.Integer(), autoincrement=False, nullable=False))
        batch_op.create_foreign_key(None, 'actions', ['action_id'], ['id'])
        batch_op.drop_column('name')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('action_templates_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('action_id')

    with op.batch_alter_table('action_templates', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('action_id')

    # ### end Alembic commands ###
