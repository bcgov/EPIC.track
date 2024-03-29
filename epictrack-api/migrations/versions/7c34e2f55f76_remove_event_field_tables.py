"""remove event field tables

Revision ID: 7c34e2f55f76
Revises: 76e845b31c8d
Create Date: 2023-10-12 18:47:21.102389

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7c34e2f55f76'
down_revision = '76e845b31c8d'
branch_labels = None
depends_on = None

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("DROP TABLE event_field_values_history CASCADE")
    op.execute("DROP TABLE event_fields CASCADE")
    op.execute("DROP TABLE event_field_values CASCADE")
    op.execute("DROP TABLE event_fields_history CASCADE")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event_fields_history',
    sa.Column('id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('event_category_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_type_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('field_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('reference', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('control_label', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('validations', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("timezone('utc'::text, CURRENT_TIMESTAMP)"), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('pk', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('during', postgresql.TSTZRANGE(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_category_id'], ['event_categories.id'], name='event_fields_history_event_category_id_fkey'),
    sa.ForeignKeyConstraint(['event_type_id'], ['event_types.id'], name='event_fields_history_event_type_id_fkey'),
    sa.PrimaryKeyConstraint('id', 'pk', name='event_fields_history_pkey')
    )
    op.create_table('event_field_values',
    sa.Column('created_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=False),
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('field_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('value', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name='event_field_values_event_id_fkey'),
    sa.ForeignKeyConstraint(['field_id'], ['event_fields.id'], name='event_field_values_field_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='event_field_values_pkey')
    )
    op.create_table('event_fields',
    sa.Column('created_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=False),
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('event_fields_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('event_category_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_type_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('field_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('reference', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('control_label', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('validations', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_category_id'], ['event_categories.id'], name='event_fields_event_category_id_fkey'),
    sa.ForeignKeyConstraint(['event_type_id'], ['event_types.id'], name='event_fields_event_type_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='event_fields_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('event_field_values_history',
    sa.Column('id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('field_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('value', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text("timezone('utc'::text, CURRENT_TIMESTAMP)"), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.Column('pk', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('during', postgresql.TSTZRANGE(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name='event_field_values_history_event_id_fkey'),
    sa.ForeignKeyConstraint(['field_id'], ['event_fields.id'], name='event_field_values_history_field_id_fkey'),
    sa.PrimaryKeyConstraint('id', 'pk', name='event_field_values_history_pkey')
    )
    # ### end Alembic commands ###
