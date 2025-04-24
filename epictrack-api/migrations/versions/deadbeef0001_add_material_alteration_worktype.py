"""add material alteration work type
Revision ID: deadbeef0001
Revises: 888efab5d43c
Create Date: 2025-04-24 3:27:00.000000
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'deadbeef0001'  # Replace with generated revision ID
down_revision = '888efab5d43c'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        INSERT INTO work_types (sort_order, name, created_by, created_at, updated_by, updated_at, is_active, is_deleted, report_title)
        VALUES (
            14,
            'Material Alteration',
            'alembic_migration',
            NOW(),
            'alembic_migration',
            NOW(),
            TRUE,
            FALSE,
            'Consent for Material Alteration'
        )
    """)


def downgrade():
    op.execute("""
        DELETE FROM work_types
        WHERE name = 'Material Alteration'
    """)