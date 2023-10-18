"""update_types_subtypes

Revision ID: 4f89baa1d849
Revises: 7c7efec93955
Create Date: 2023-02-08 22:59:38.656988

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '4f89baa1d849'
down_revision = '7c7efec93955'
branch_labels = None
depends_on = None

types = sa.table(
      'types',
      sa.Column('id', sa.Integer),
      sa.Column('name', sa.Text),
      sa.Column('updated_by', sa.Text),
      sa.Column('updated_at', sa.DateTime)
)

sub_types = sa.table(
      'sub_types',
      sa.Column('id', sa.Integer),
      sa.Column('name', sa.Text),
      sa.Column('updated_by', sa.Text),
      sa.Column('updated_at', sa.DateTime)
)

def upgrade():
    op.execute(types.update().\
               where(types.c.id==op.inline_literal(2)).\
               values({'name':op.inline_literal('Energy - Petroleum & Natural Gas'),\
                      'updated_by':op.inline_literal('u1'),\
                      'updated_at':datetime.now()}))
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
             op.execute(sub_types.update().\
               where(sub_types.c.id==op.inline_literal(item['id'])).\
               values({'name':op.inline_literal(item['name']),\
                      'updated_by':op.inline_literal('u1'),\
                      'updated_at':datetime.now()}))

    # ### end Alembic commands ###


def downgrade():
    op.execute(types.update().\
               where(types.c.id==op.inline_literal(2)).\
               values({'name':op.inline_literal('Energy - Oil and Natural Gas'),\
                      'updated_by':op.inline_literal('u1'),\
                      'updated_at':datetime.now()}))
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
            op.execute(sub_types.update().\
               where(sub_types.c.id==op.inline_literal(item['id'])).\
               values({'name':op.inline_literal(item['name']),\
                      'updated_by':op.inline_literal('u1'),\
                      'updated_at':datetime.now()}))
    # ### end Alembic commands ###
