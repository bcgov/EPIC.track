"""added notes and pip fields to indigenous nations.

Revision ID: 7deec389ae56
Revises: d8b405f9d663
Create Date: 2023-10-18 11:46:46.577009

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7deec389ae56'
down_revision = 'd8b405f9d663'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('indigenous_nations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('notes', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('pip_org_type_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'pip_org_types', ['pip_org_type_id'], ['id'])

    with op.batch_alter_table('indigenous_nations_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('notes', sa.String(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('pip_org_type_id', sa.Integer(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key(None, 'pip_org_types', ['pip_org_type_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('indigenous_nations_history', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('pip_org_type_id')
        batch_op.drop_column('notes')

    with op.batch_alter_table('indigenous_nations', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('pip_org_type_id')
        batch_op.drop_column('notes')

    # ### end Alembic commands ###
