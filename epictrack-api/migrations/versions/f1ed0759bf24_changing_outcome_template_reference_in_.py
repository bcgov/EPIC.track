"""changing outcome template reference in event

Revision ID: f1ed0759bf24
Revises: 9ab303c99132
Create Date: 2023-10-16 21:44:10.662360

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1ed0759bf24'
down_revision = '9ab303c99132'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_constraint('events_outcome_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'outcome_configurations', ['outcome_id'], ['id'])

    with op.batch_alter_table('events_history', schema=None) as batch_op:
        batch_op.drop_constraint('events_history_outcome_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'outcome_configurations', ['outcome_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events_history', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('events_history_outcome_id_fkey', 'outcome_templates', ['outcome_id'], ['id'])

    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('events_outcome_id_fkey', 'outcome_templates', ['outcome_id'], ['id'])

    # ### end Alembic commands ###
