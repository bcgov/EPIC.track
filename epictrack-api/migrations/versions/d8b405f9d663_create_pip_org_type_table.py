"""create pip_org_type table

Revision ID: d8b405f9d663
Revises: 47b41964f6df
Create Date: 2023-10-18 11:45:36.531064

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd8b405f9d663'
down_revision = '47b41964f6df'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    pip_org_type = op.create_table('pip_org_types',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_by', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"), nullable=True),
    sa.Column('updated_by', sa.String(length=255), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', nullable=False),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_table('pip_org_types_history',
    sa.Column('id', sa.Integer(), autoincrement=False, nullable=False),
    sa.Column('name', sa.String(), autoincrement=False, nullable=False),
    sa.Column('created_by', sa.String(length=255), autoincrement=False, nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.String(length=255), autoincrement=False, nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.Boolean(), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.Boolean(), autoincrement=False, nullable=False),
    sa.Column('pk', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
    sa.PrimaryKeyConstraint('id', 'pk'),
    sqlite_autoincrement=True
    )
    op.bulk_insert(pip_org_type,
    [
        {
            "name": "Clan"
        },
        {
            "name": "First Nation"
        },
        {
            "name": "First Nation Group"
        },
        {
            "name": "House"
        },
        {
            "name": "Keyoh"
        },
        {
            "name": "Metis"
        },
        {
            "name": "Tribal Council"
        },
        {
            "name": "Wilp"
        }
  ])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('pip_org_types_history')
    op.drop_table('pip_org_types')
    # ### end Alembic commands ###
