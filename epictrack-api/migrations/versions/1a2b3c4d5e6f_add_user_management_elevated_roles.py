"""
Revision ID: 1a2b3c4d5e6f
Revises: 194a9071c954
Create Date: 2025-02-27
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = '194a9071c954'
branch_labels = None
depends_on = None

def upgrade():
    # Create elevated_roles table
    op.create_table(
        'elevated_roles',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False, unique=True),
        sa.Column('description', sa.String(length=500)),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.BOOLEAN(), nullable=False),
        sa.Column('is_deleted', sa.BOOLEAN(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    # Insert initial elevated role
    op.execute("""
        INSERT INTO elevated_roles (name, description, sort_order, is_active, is_deleted, created_by) 
        VALUES ('Manage First Nations', 'Permissions for managing First Nations information', 1, true, false, 'system')
    """)

    # Create staff_elevated_roles table
    op.create_table(
        'staff_elevated_roles',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('staff_id', sa.Integer(), nullable=False),
        sa.Column('elevated_role_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.BOOLEAN(), nullable=False),
        sa.Column('is_deleted', sa.BOOLEAN(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['staff_id'], ['staffs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['elevated_role_id'], ['elevated_roles.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('staff_id', 'elevated_role_id')
    )

    op.execute("CREATE SEQUENCE staff_elevated_roles_history_pk_seq")
    # Create table
    op.create_table(
        'staff_elevated_roles_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('staff_id', sa.Integer(), nullable=False),
        sa.Column('elevated_role_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("timezone('utc', CURRENT_TIMESTAMP)"), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
        sa.Column('pk', sa.Integer(), nullable=False, server_default=sa.text("nextval('staff_elevated_roles_history_pk_seq')")),
        sa.PrimaryKeyConstraint('id', 'pk', name='staff_elevated_roles_history_pkey'),
        sa.ForeignKeyConstraint(['staff_id'], ['staffs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['elevated_role_id'], ['elevated_roles.id'], ondelete='CASCADE'),
    )

def downgrade():
    # Drop staff_elevated_roles_history table
    op.drop_table('staff_elevated_roles_history')
    # Drop sequence
    op.execute("DROP SEQUENCE staff_elevated_roles_history_pk_seq")
    # Drop staff_elevated_roles table first due to dependency
    op.drop_table('staff_elevated_roles')
    # Drop elevated_roles table
    op.drop_table('elevated_roles')
