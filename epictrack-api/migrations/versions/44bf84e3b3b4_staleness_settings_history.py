from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = '44bf84e3b3b4'
down_revision = '888ac4f583d2'
branch_labels = None
depends_on = None

def upgrade():
    # Add the new column to the table
    op.add_column('staleness_settings_history', sa.Column('sort_order', sa.Integer(), nullable=True))

def downgrade():
    # Remove the column if the migration is rolled back
    op.drop_column('staleness_settings_history', 'sort_order')
