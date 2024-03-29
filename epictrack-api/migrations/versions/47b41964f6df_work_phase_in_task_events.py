"""work_phase in task events

Revision ID: 47b41964f6df
Revises: f1ed0759bf24
Create Date: 2023-10-17 18:13:13.630485

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '47b41964f6df'
down_revision = 'f1ed0759bf24'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('task_events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('work_phase_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('task_events_work_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('task_events_phase_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'work_phases', ['work_phase_id'], ['id'])
        batch_op.drop_column('work_id')
        batch_op.drop_column('phase_id')

    with op.batch_alter_table('task_events_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('work_phase_id', sa.Integer(), autoincrement=False, nullable=True))
        batch_op.drop_constraint('task_events_history_phase_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('task_events_history_work_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'work_phases', ['work_phase_id'], ['id'])
        batch_op.drop_column('work_id')
        batch_op.drop_column('phase_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('task_events_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phase_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('work_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('task_events_history_work_id_fkey', 'works', ['work_id'], ['id'])
        batch_op.create_foreign_key('task_events_history_phase_id_fkey', 'phase_codes', ['phase_id'], ['id'])
        batch_op.drop_column('work_phase_id')

    with op.batch_alter_table('task_events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phase_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('work_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('task_events_phase_id_fkey', 'phase_codes', ['phase_id'], ['id'])
        batch_op.create_foreign_key('task_events_work_id_fkey', 'works', ['work_id'], ['id'])
        batch_op.drop_column('work_phase_id')

    # ### end Alembic commands ###
