"""
Revision ID: 65a8e27d8879
Revises: 1a2b3c4d5e6f
Create Date: 2025-03-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '65a8e27d8879'
down_revision = '1a2b3c4d5e6f'
branch_labels = None
depends_on = None

staleness_type_enum = postgresql.ENUM('ISSUES', 'STATUS', name='staleness_type_enum', create_type=True)

def upgrade():
    # Create staleness_settings table
    op.create_table(
        'staleness_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('staleness_type', staleness_type_enum, nullable=False),
        sa.Column('warning_length', sa.Integer(), nullable=False),
        sa.Column('staleness_length', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
    )
    
    # Insert initial values
    op.bulk_insert(
        sa.table(
            'staleness_settings',
            sa.Column('staleness_type', sa.String()),
            sa.Column('warning_length', sa.Integer()),
            sa.Column('staleness_length', sa.Integer()),
            sa.Column('is_active', sa.Boolean()),
            sa.Column('is_deleted', sa.Boolean())
        ),
        [
            {'staleness_type': 'ISSUES', 'warning_length': 7, 'staleness_length': 14, 'is_active': True, 'is_deleted': False},
            {'staleness_type': 'STATUS', 'warning_length': 7, 'staleness_length': 14, 'is_active': True, 'is_deleted': False}
        ]
    )

    op.execute("CREATE SEQUENCE staleness_settings_history_pk_seq")
    # Create table
    op.create_table(
        'staleness_settings_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('staleness_type', staleness_type_enum, nullable=False),
        sa.Column('warning_length', sa.Integer(), nullable=False),
        sa.Column('staleness_length', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
        sa.Column('pk', sa.Integer(), nullable=False, server_default=sa.text("nextval('staleness_settings_history_pk_seq')")),
        sa.PrimaryKeyConstraint('id', 'pk', name='staleness_settings_history_pkey'),
    )

def downgrade():
    # Drop staleness_settings_history table
    op.execute("DROP SEQUENCE staleness_settings_history_pk_seq")
    op.execute("DROP SEQUENCE staleness_settings_pk_seq")
    # Drop staleness_settings table
    op.drop_table('staleness_settings')
    
    # Drop staleness_type enum
    op.execute('DROP TYPE staleness_type_enum')