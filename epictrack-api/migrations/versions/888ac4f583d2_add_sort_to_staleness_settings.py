from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = '888ac4f583d2'
down_revision = '65a8e27d8879'
branch_labels = None
depends_on = None

def upgrade():
    # Add the new column to the table
    op.add_column('staleness_settings', sa.Column('sort_order', sa.Integer(), nullable=False, server_default=sa.text('0')))
    
    # Update existing data
    op.execute("""
        UPDATE staleness_settings
        SET sort_order = CASE
            WHEN staleness_type = 'ISSUES' THEN 2
            WHEN staleness_type = 'STATUS' THEN 1
            ELSE 0
        END
    """)

def downgrade():
    # Remove the column if the migration is rolled back
    op.drop_column('staleness_settings', 'sort_order')
