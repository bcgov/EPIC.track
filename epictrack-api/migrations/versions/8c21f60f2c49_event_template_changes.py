"""event_template changes

Revision ID: 8c21f60f2c49
Revises: 7e5b18bc3506
Create Date: 2023-07-29 16:12:21.103938

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8c21f60f2c49'
down_revision = '7e5b18bc3506'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('event_templates', schema=None) as batch_op:
        batch_op.add_column(sa.Column('parent_id', sa.Integer(), nullable=True))
        batch_op.alter_column('start_at',
               existing_type=sa.VARCHAR(),
               nullable=True)

    with op.batch_alter_table('event_templates_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('parent_id', sa.Integer(), autoincrement=False, nullable=True))
        batch_op.alter_column('start_at',
               existing_type=sa.VARCHAR(),
               nullable=True,
               autoincrement=False)

    with op.batch_alter_table('outcomes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('event_template_id', sa.Integer(), nullable=False))
        batch_op.drop_constraint('outcomes_event_type_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('outcomes_event_category_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('outcomes_phase_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'event_templates', ['event_template_id'], ['id'])
        batch_op.drop_column('event_type_id')
        batch_op.drop_column('phase_id')
        batch_op.drop_column('event_category_id')

    with op.batch_alter_table('outcomes_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('event_template_id', sa.Integer(), autoincrement=False, nullable=False))
        batch_op.drop_constraint('outcomes_history_event_type_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('outcomes_history_phase_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('outcomes_history_event_category_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'event_templates', ['event_template_id'], ['id'])
        batch_op.drop_column('event_type_id')
        batch_op.drop_column('phase_id')
        batch_op.drop_column('event_category_id')

    with op.batch_alter_table('phase_codes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('number_of_days', sa.Integer(), default=0, nullable=True))
        batch_op.drop_column('duration')

    with op.batch_alter_table('phase_codes_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('number_of_days', sa.Integer(), autoincrement=False, default=0, nullable=True))
        batch_op.drop_column('duration')

    with op.batch_alter_table('work_phases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('end_date', sa.DateTime(timezone=True), nullable=True))
        batch_op.drop_column('anticipated_end_date')

    with op.batch_alter_table('work_phases_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('end_date', sa.DateTime(timezone=True), autoincrement=False, nullable=True))
        batch_op.drop_column('anticipated_end_date')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('work_phases_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('anticipated_end_date', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True))
        batch_op.drop_column('end_date')

    with op.batch_alter_table('work_phases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('anticipated_end_date', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True))
        batch_op.drop_column('end_date')

    with op.batch_alter_table('phase_codes_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_column('number_of_days')

    with op.batch_alter_table('phase_codes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_column('number_of_days')

    with op.batch_alter_table('outcomes_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('event_category_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('phase_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('event_type_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('outcomes_history_event_category_id_fkey', 'event_categories', ['event_category_id'], ['id'])
        batch_op.create_foreign_key('outcomes_history_phase_id_fkey', 'phase_codes', ['phase_id'], ['id'])
        batch_op.create_foreign_key('outcomes_history_event_type_id_fkey', 'event_types', ['event_type_id'], ['id'])
        batch_op.drop_column('event_template_id')

    with op.batch_alter_table('outcomes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('event_category_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('phase_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('event_type_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('outcomes_phase_id_fkey', 'phase_codes', ['phase_id'], ['id'])
        batch_op.create_foreign_key('outcomes_event_category_id_fkey', 'event_categories', ['event_category_id'], ['id'])
        batch_op.create_foreign_key('outcomes_event_type_id_fkey', 'event_types', ['event_type_id'], ['id'])
        batch_op.drop_column('event_template_id')

    with op.batch_alter_table('event_templates_history', schema=None) as batch_op:
        batch_op.alter_column('start_at',
               existing_type=sa.VARCHAR(),
               nullable=False,
               autoincrement=False)
        batch_op.drop_column('parent_id')

    with op.batch_alter_table('event_templates', schema=None) as batch_op:
        batch_op.alter_column('start_at',
               existing_type=sa.VARCHAR(),
               nullable=False)
        batch_op.drop_column('parent_id')

    # ### end Alembic commands ###
