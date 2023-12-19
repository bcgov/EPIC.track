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
    op.execute("TRUNCATE sub_types RESTART IDENTITY CASCADE")
    op.execute("alter sequence sub_types_id_seq restart with 1")
    one = "INSERT INTO sub_types (short_name,type_id,name,created_by,created_at,updated_by,updated_at,is_active,is_deleted,sort_order) VALUES\
	 ('Plant',1,'Power Plants',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,1),\
	 ('Lines',1,'Transmission Lines',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,2),\
	 ('Refinery',2,'Oil Refineries',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,4),\
	 ('Metals',3,'Primary Metals',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,9),\
	 ('Non-Metallic',3,'Non-metallic Mineral Products',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,10),\
	 ('Forest',3,'Forest Products',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,11),\
	 ('Other',3,'Other Industries',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,12),\
	 ('Coal',4,'Coal Mines',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,13),\
	 ('Mineral',4,'Mineral Mines',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,14),\
	 ('Gravel',4,'Sand and Gravel Pits',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,15)"
    two = "INSERT INTO sub_types (short_name,type_id,name,created_by,created_at,updated_by,updated_at,is_active,is_deleted,sort_order) VALUES\
	 ('Placer',4,'Placer Mineral Mines',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,16),\
	 ('Offshore',4,'Offshore Mines',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,18),\
	 ('Resort',5,'Resort Developments',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,19),\
	 ('Golf',5,'Golf Resorts',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,20),\
	 ('Marina',5,'Marina Resorts',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,21),\
	 ('Ski',5,'Ski Resorts',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,22),\
	 ('Highway',6,'Public Highways',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,23),\
	 ('Railway',6,'Railways',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,24),\
	 ('Ferry',6,'Ferry Terminals',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,25),\
	 ('Port',6,'Marine Ports',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,26)"
    three = "INSERT INTO sub_types (short_name,type_id,name,created_by,created_at,updated_by,updated_at,is_active,is_deleted,sort_order) VALUES\
	 ('Airport',6,'Airports',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,27),\
	 ('Dams',8,'Dams',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,31),\
	 ('Dikes',8,'Dikes',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,32),\
	 ('Diversion',8,'Water Diversion',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,33),\
	 ('Groundwater',8,'Groundwater Extraction',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,34),\
	 ('Shoreline',8,'Shoreline Modification',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,35),\
	 ('Other',9,'Other',NULL,'2023-01-31 20:53:25.024762+00',NULL,NULL,true,false,32767),\
	 ('Proccesing',2,'Natural Gas Processing Plants',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.806071+00',true,false,5),\
	 ('Storage',2,'Energy Storage Facilities',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.80806+00',true,false,3),\
	 ('Pipeline',2,'Transmission Pipelines',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.808792+00',true,false,6)"
    four = "INSERT INTO sub_types (short_name,type_id,name,created_by,created_at,updated_by,updated_at,is_active,is_deleted,sort_order) VALUES\
	 ('Offshore',2,'Offshore Oil or Gas Facilities',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.809499+00',true,false,7),\
	 ('Chemicals',3,'Organic & Inorganic Chemical',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.810227+00',true,false,8),\
	 ('Stone',4,'Construction Stone & Industrial Mineral Quarries',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.810975+00',true,false,17),\
	 ('Hazardous',7,'Hazardous Waste Facilities',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.811693+00',true,false,28),\
	 ('Solid',7,'Solid Waste Management Facilities',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.812239+00',true,false,29),\
	 ('Liquid',7,'Local Government Liquid Waste Management Facilities',NULL,'2023-01-31 20:53:25.024762+00','u1','2023-02-09 18:25:04.812769+00',true,false,30)"
    op.execute(one)
    op.execute(two)
    op.execute(three)
    op.execute(four)
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
        op.execute(f"UPDATE sub_types set name='{sub_type_data.get('new_name')}' WHERE name='{sub_type_data.get('old_name')}'")
        # old_name = sub_type_data.pop("old_name")
        # sub_type_data["name"] = sub_type_data.pop("new_name")
        # query = sa.text(f"SELECT id from sub_types WHERE name='{old_name}'")
        # sub_type_obj = conn.execute(query, sub_type_data).fetchone()
        # conn.execute(
        #         sub_types_table.update()
        #         .where(sub_types_table.c.id == sub_type_obj.id)
        #         .values(**sub_type_data)
        #     )


def downgrade():
    pass
