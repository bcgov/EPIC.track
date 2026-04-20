"""Add Joint Complex Amendment Work

Revision ID: 8ef7aa13abdd
Revises: 6d65d9ec068b
Create Date: 2026-04-17 12:00:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = '8ef7aa13abdd'
down_revision = '6d65d9ec068b'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        INSERT INTO work_types (
        sort_order,
        id,
        name,
        created_by,
        created_at,
        updated_by,
        updated_at,
        is_active,
        is_deleted,
        report_title
    )
    VALUES (
        15,
        16,
        'Joint Complex Amendment',
        NULL,
        NOW(),
        NULL,
        NULL,
        TRUE,
        FALSE,
        'Joint Complex Amendment'
    );
    """)

def downgrade():
    op.execute("DELETE FROM work_types WHERE name = 'Joint Complex Amendment'")