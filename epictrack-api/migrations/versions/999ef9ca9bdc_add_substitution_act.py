"""Update legislation names and insert CER Act (2019)

Revision ID: 999ef9ca9bdc
Revises: deadbeef0001
Create Date: 2025-07-09

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '999ef9ca9bdc'
down_revision = 'deadbeef0001'
branch_labels = None
depends_on = None

def upgrade():
    # Update names
    op.execute("UPDATE substitution_acts SET name = 'CEAA (2004)' WHERE id = 1")
    op.execute("UPDATE substitution_acts SET name = 'CEAA (2012)' WHERE id = 2")

    # Insert new entry
    op.execute(
        "INSERT INTO substitution_acts (name, sort_order) VALUES ('CER Act (2019)', 5)"
    )

def downgrade():
    # Revert names
    op.execute("UPDATE substitution_acts SET name = 'CEAA 2004' WHERE id = 1")
    op.execute("UPDATE substitution_acts SET name = 'CEAA 2012' WHERE id = 2")

    # Delete inserted row
    op.execute("DELETE FROM substitution_acts WHERE name = 'CER Act (2019)'")
