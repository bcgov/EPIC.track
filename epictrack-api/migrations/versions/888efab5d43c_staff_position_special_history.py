"""staff position special history
Revision ID: 888efab5d43c
Revises: 44bf84e3b3b4
Create Date: 2025-03-28 17:26:05.163181
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '888efab5d43c'
down_revision = '44bf84e3b3b4'
branch_labels = None
depends_on = None


def upgrade():
    # update entity enum
    op.execute("ALTER TYPE entityenum ADD VALUE IF NOT EXISTS 'STAFF'")

    # Add new DTU position
    op.execute("""
        INSERT INTO positions (name, sort_order) 
        VALUES ('No Active Position', 13)
    """)
    
    # Migrate existing staff position data to special_fields
    op.execute("""
        INSERT INTO special_fields (entity, entity_id, field_name, field_value, time_range, field_type, is_active, is_deleted, created_at)
        SELECT 
            'STAFF' AS entity,
            s.id AS entity_id,
            'position_id' AS field_name,
            s.position_id AS field_value,
            tstzrange(NOW(), (
                SELECT MIN(lower(time_range)) 
                FROM special_fields sf 
                WHERE sf.entity = 'STAFF' 
                AND sf.entity_id = s.id 
                AND sf.field_name = 'position_id'
            ), '[)') AS time_range,
            'INTEGER' AS field_type,
            TRUE AS is_active,
            FALSE AS is_deleted,
            NOW() AS created_at
        FROM staffs s
        WHERE s.position_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM special_fields sf 
            WHERE sf.entity = 'STAFF' 
            AND sf.entity_id = s.id 
            AND sf.field_name = 'position_id'
        );
    """)


def downgrade():
    # Remove inserted special_fields records
    op.execute(sa.text("""
        DELETE FROM special_fields 
        WHERE field_name = 'position_id' 
        AND entity = 'STAFF'
    """))
    # remove added position
    op.execute("DELETE FROM positions WHERE name = 'No Active Position'")