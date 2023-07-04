"""adding eventtypes and categories

Revision ID: 6c784cb24718
Revises: ab8c1c1ccfe6
Create Date: 2023-07-04 11:33:16.047289

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c784cb24718'
down_revision = 'ab8c1c1ccfe6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    event_config = [
            {
                "category": "Milestone",
                "types": [
                    "Generic",
                    "Meeting",
                    "Notification",
                    "Order",
                    "Referral",
                    "Report",
                    "Request",
                    "Submission",
                    "Other"
                ]
            },{
                "category": "Extension",
                "types": [
                    "Time Limit Extension",
                    "PCP Time Limit Extension",
                ]
            },{
                "category": "Suspension",
                "types": [
                    "Time Limit Suspension"
                ]
            },{
                "category": "Decision",
                "types": [
                    "EAC Ministers",
                    "Minister",
                    "CEAO",
                    "ADM",
                    "EPD",
                    "PAD (Lead)",
                    "Reviewer",
                    "Federal",
                    "Other"
                ]
            },{
                "category": "PCP",
                "types": [
                    "Comment Period",
                    "Open House",
                    "Virtual Information Session",
                    "Time Limit Extension",
                    "Other"
                ]
            },{
                "category": "Calendar",
                "types": [
                    "Communications",
                    "Executive",
                    "Financial",
                    "Work",
                    "Other"
                ]
            },{
                "category": "Finance",
                "types": [
                    "Capacity Funding",
                    "Fee Order",
                    "Penalties",
                    "Administrative",
                    "Other"
                ]
            }
        ]
    conn = op.get_bind()
    event_category = sa.sql.table('event_categories',
                            sa.Column('id', sa.Integer),
                            sa.Column('name', sa.String),
                            sa.Column('sort_order', sa.Integer))
    event_types = sa.sql.table('event_types',
                        sa.Column('id', sa.Integer),
                        sa.Column('name', sa.String),
                        sa.Column('event_category_id', sa.Integer),
                        sa.Column('sort_order', sa.Integer))
    for conf_index, conf in enumerate(event_config):
        cat_obj = conn.execute(event_category.insert({
            "name": conf["category"],
            "sort_order": (conf_index+1)
            })
            .returning(
            (event_category.c.id).label('id')
            )
            )
        cat_id = cat_obj.first()["id"]
        for type_index, type in enumerate(conf["types"]):
            conn.execute(event_types.insert(
                {
                    "name": type,
                    "event_category_id": cat_id,
                    "sort_order": (type_index+1)
                }
            ))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
