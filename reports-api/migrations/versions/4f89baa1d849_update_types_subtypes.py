"""update_types_subtypes

Revision ID: 4f89baa1d849
Revises: 7c7efec93955
Create Date: 2023-02-08 22:59:38.656988

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '4f89baa1d849'
down_revision = '7c7efec93955'
branch_labels = None
depends_on = None
conn = op.get_bind()

def upgrade():
    conn.execute(sa.text("UPDATE types SET name=:name,updated_by='u1',updated_at=:date WHERE id=:id"),**{'name':'Energy - Petroleum & Natural Gas','id':2,'date':datetime.now()})
    subtypes_updates = [
        {
            'name':'Natural Gas Processing Plants',
            'id': 5
        },
        {
            'name':'Energy Storage Facilities',
            'id': 3
        },
        {
            'name':'Transmission Pipelines',
            'id': 6
        },
        {
            'name':'Offshore Oil or Gas Facilities',
            'id': 7
        },
        {
            'name':'Organic & Inorganic Chemical',
            'id': 8
        },
        {
            'name':'Construction Stone & Industrial Mineral Quarries',
            'id': 17
        },
        {
            'name':'Hazardous Waste Facilities',
            'id': 28
        },
        {
            'name':'Solid Waste Management Facilities',
            'id': 29
        },
        {
            'name':'Local Government Liquid Waste Management Facilities',
            'id': 30
        }
    ]
    for item in subtypes_updates:
            conn.execute(sa.text("UPDATE sub_types SET name=:name,updated_by='u1',updated_at=:date WHERE id=:id"),**{'name':item['name'],'id':item['id'],'date':datetime.now()})

    # ### end Alembic commands ###


def downgrade():
    conn.execute(sa.text("UPDATE types SET name=:name,updated_by='u1',updated_at=:date WHERE id=:id"),**{'name':'Energy - Oil and Natural Gas','id':2,'date':datetime.now()})
    subtypes_updates = [
        {
            'name':'Processing Plants',
            'id': 5
        },
        {
            'name':'Storage Facilities',
            'id': 3
        },
        {
            'name':'Pipelines',
            'id': 6
        },
        {
            'name':'Offshore Facilities',
            'id': 7
        },
        {
            'name':'Organic and Inorganic Chemicals',
            'id': 8
        },
        {
            'name':'Construction Stone/Industrial Minerals',
            'id': 17
        },
        {
            'name':'Hazardous Waste Management',
            'id': 28
        },
        {
            'name':'Solid Waste Management',
            'id': 29
        },
        {
            'name':'Liquid Waste Management',
            'id': 30
        }
    ]
    for item in subtypes_updates:
            conn.execute(sa.text("UPDATE sub_types SET name=:name,updated_by:'u1',updated_at=:date WHERE id=:id"),**{'name':item['name'],'id':item['id'],'date':datetime.now()})

    # ### end Alembic commands ###
