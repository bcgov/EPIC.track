"""work_phase_suspension fields

Revision ID: 6a36f4738b0f
Revises: 4b5f3a264271
Create Date: 2023-10-26 19:50:28.382039

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6a36f4738b0f'
down_revision = '4b5f3a264271'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("CREATE TYPE eventpositionenum AS ENUM('START', 'INTERMEDIATE', 'END')")
    op.execute("ALTER TABLE event_templates ALTER COLUMN event_position TYPE eventpositionenum USING event_position::text::eventpositionenum")
    op.execute("ALTER TABLE event_templates_history ALTER COLUMN event_position TYPE eventpositionenum USING event_position::text::eventpositionenum")

    with op.batch_alter_table('work_phases', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=250), nullable=True))
        batch_op.add_column(sa.Column('is_suspended', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('suspended_date', sa.DateTime(timezone=True), nullable=True))

    with op.batch_alter_table('work_phases_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=250), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('is_suspended', sa.Boolean(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('suspended_date', sa.DateTime(timezone=True), autoincrement=False, nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('work_phases_history', schema=None) as batch_op:
        batch_op.drop_column('suspended_date')
        batch_op.drop_column('is_suspended')
        batch_op.drop_column('name')

    with op.batch_alter_table('work_phases', schema=None) as batch_op:
        batch_op.drop_column('suspended_date')
        batch_op.drop_column('is_suspended')
        batch_op.drop_column('name')

    with op.batch_alter_table('event_templates_history', schema=None) as batch_op:
        batch_op.alter_column('event_position',
               existing_type=sa.Enum('START', 'INTERMEDIATE', 'END', name='eventpositionenum'),
               type_=sa.VARCHAR(),
               existing_nullable=True,
               autoincrement=False)

    with op.batch_alter_table('event_templates', schema=None) as batch_op:
        batch_op.alter_column('event_position',
               existing_type=sa.Enum('START', 'INTERMEDIATE', 'END', name='eventpositionenum'),
               type_=sa.VARCHAR(),
               existing_nullable=True)

    # ### end Alembic commands ###