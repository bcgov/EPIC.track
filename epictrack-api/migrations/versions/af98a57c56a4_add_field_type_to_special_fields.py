"""add field type to special fields

Revision ID: af98a57c56a4
Revises: eccbb8b96011
Create Date: 2025-02-02 20:55:34.196995

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'af98a57c56a4'
down_revision = 'eccbb8b96011'
branch_labels = None
depends_on = None

fieldtypeenum = postgresql.ENUM('STRING', 'INTEGER', 'BOOLEAN', name='fieldtypeenum', create_type=True)

def upgrade():
    # create field type enum
    fieldtypeenum.create(op.get_bind(), checkfirst=True)

    # add field type column to special_fields
    op.add_column(
        'special_fields',
        sa.Column('field_type', fieldtypeenum, nullable=True)
    )

    op.add_column(
        'special_fields_history',
        sa.Column('field_type', fieldtypeenum, nullable=True)
    )

    # set existing field types, up to this point all field types will either be string or integer
    op.execute("""
        UPDATE special_fields
        SET field_type = 
            CASE 
                WHEN field_value ~ '^[0-9]+$' THEN 'INTEGER'::fieldtypeenum
                ELSE 'STRING'::fieldtypeenum
            END
    """)


def downgrade():
    op.drop_column('special_fields', 'field_type')
    op.drop_column('special_fields_history', 'field_type')
    fieldtypeenum.drop(op.get_bind(), checkfirst=True)
