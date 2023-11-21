"""master data changes

Revision ID: 1d3c34a30cfb
Revises: 213ca6b67dcc
Create Date: 2023-11-21 20:45:58.380511

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '1d3c34a30cfb'
down_revision = '213ca6b67dcc'
branch_labels = None
depends_on = None


def upgrade():
    sub_types_table = sa.table(
        "sub_types",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("short_name", sa.String),
        sa.column("sort_order", sa.Integer),
        sa.column("type_id", sa.Integer),
    )
    sub_types = [
        {"old_name": "Forest Products", "new_name": "Forest Products Industries"},
        {"old_name": "Non-metallic Mineral Products", "new_name": "Non-metallic Mineral Products Industries"},
        {"old_name": "Organic & Inorganic Chemical", "new_name": "Organic and Inorganic Chemical Industry"},
        {"old_name": "Construction Stone & Industrial Mineral Quarries", "new_name": "Construction Stone and Industrial Mineral Quarries"},
        {"old_name": "Marine Port Projects", "new_name": "Marine Ports"},
    ]

    query = sa.text(f"SELECT id, name from types")
    conn = op.get_bind()
    for sub_type_data in sub_types:
        old_name = sub_type_data.pop("old_name")
        sub_type_data["name"] = sub_type_data.pop("new_name")
        query = sa.text(f"SELECT id from sub_types WHERE name='{old_name}'")
        sub_type_obj = conn.execute(query, sub_type_data).fetchone()
        conn.execute(
                sub_types_table.update()
                .where(sub_types_table.c.id == sub_type_obj.id)
                .values(**sub_type_data)
            )


def downgrade():
    pass
