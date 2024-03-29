"""post_by column added

Revision ID: 0f32217af693
Revises: b111bf366202
Create Date: 2023-02-15 15:02:22.101876

"""
from alembic import op
from datetime import datetime
from sqlalchemy.sql import table, column
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0f32217af693'
down_revision = 'b111bf366202'
branch_labels = None
depends_on = None

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('work_statuses', sa.Column('posted_by', sa.String(length=100), nullable=True))
    substitution_table = table(
        "substitution_acts",
        column("name",sa.String),
        column("updated_by",sa.String),
        column('updated_at',sa.DateTime),
        column("sort_order",sa.Integer)
    )
    op.bulk_insert(substitution_table,[
        {
            'name':'None',
            'sort_order': 4,
            'updated_by': 'u1',
            'updated_at': datetime.now()
        }
    ])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('work_statuses', 'posted_by')
    op.execute('DELETE FROM substitution_acts WHERE name=\'None\'')
    # ### end Alembic commands ###
