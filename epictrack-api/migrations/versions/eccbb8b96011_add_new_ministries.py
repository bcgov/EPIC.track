"""add new ministries

Revision ID: eccbb8b96011
Revises: 09fb62ec79e9
Create Date: 2025-01-02 15:19:17.743999

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'eccbb8b96011'
down_revision = '09fb62ec79e9'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE ministries SET sort_order = sort_order + 7 WHERE name != 'Not Applicable'")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Mining and Critical Minerals','MCM',2)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Forests','FOR',3)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Jobs, Economic Development and Innovation','JEDI',4)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Tourism, Arts, Culture and Sport','TACS',5)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Housing and Municipal Affairs','HOUS',6)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Water, Land and Resource Stewardship','WLRS',7)")
    op.execute("INSERT INTO ministries (name,abbreviation,sort_order) values ('Transportation and Transit','MOTI',8)")


def downgrade():
    op.execute("DELETE FROM ministries WHERE name IN ('Mining and Critical Minerals', 'Forests', 'Jobs, Economic Development and Innovation', 'Tourism, Arts, Culture and Sport', 'Housing and Municipal Affairs', 'Water, Land and Resource Stewardship', 'Transportation and Transit')")
    op.execute("UPDATE ministries SET sort_order = sort_order - 7 WHERE name != 'Not Applicable'")