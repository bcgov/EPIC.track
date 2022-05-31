"""initial_setup

Revision ID: 51ebcf9d0049
Revises: 
Create Date: 2022-02-14 14:53:53.858577

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '51ebcf9d0049'
down_revision = None
branch_labels = None
depends_on = None

import sqlalchemy as sa
from alembic import op
from sqlalchemy import String
from sqlalchemy.sql import column, table


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    work_type = op.create_table('work_types',
                                sa.Column('sort_order', sa.Integer(), nullable=True),
                                sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                                sa.Column('name', sa.String(), nullable=True),
                                sa.PrimaryKeyConstraint('id')
                                )
    op.bulk_insert(
        work_type,
        [
            {'sort_order': 110, 'name': 'Project Notification'},
            {'sort_order': 50, 'name': 'Minister\'s Designation'},
            {'sort_order': 60, 'name': 'CEAO\'s Designation'},
            {'sort_order': 40, 'name': 'Intake (Pre-EA)'},
            {'sort_order': 20, 'name': 'Exemption Order'},
            {'sort_order': 10, 'name': 'Assessment'},
            {'sort_order': 30, 'name': 'Simple Amendment'},
            {'sort_order': 30, 'name': 'Typical Amendment'},
            {'sort_order': 30, 'name': 'Complex Amendment'},
            {'sort_order': 70, 'name': 'Post-EAC Document Review'},
            {'sort_order': 80, 'name': 'EAC Extension'},
            {'sort_order': 90, 'name': 'Substantial Start Decision'},
            {'sort_order': 100, 'name': 'EAC/Order Transfer'},
            {'sort_order': 120, 'name': 'EAC/Order Suspension'},
            {'sort_order': 130, 'name': 'EAC/Order Cancellation'},
            {'sort_order': 140, 'name': 'Other'}
        ]
    )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('work_types')
    # ### end Alembic commands ###
