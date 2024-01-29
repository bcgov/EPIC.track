"""
Add Indigenous Consultation Levels table

Revision ID: 8e57d2651837
Revises: 74e58a15d180
Create Date: 2024-01-25 12:18:43.131054
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8e57d2651837'
down_revision = '74e58a15d180'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    indigenous_consultation_levels = op.create_table(
        'indigenous_consultation_levels',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("TIMEZONE('utc', CURRENT_TIMESTAMP)"), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sqlite_autoincrement=True
    )
    op.create_table(
        'indigenous_consultation_levels_history',
        sa.Column('id', sa.Integer(), autoincrement=False, nullable=False),
        sa.Column('name', sa.String(length=255), autoincrement=False, nullable=False),
        sa.Column('description', sa.String(length=255), autoincrement=False, nullable=False),
        sa.Column('sort_order', sa.Integer(), autoincrement=False, nullable=False),
        sa.Column('is_active', sa.Boolean(), autoincrement=False, nullable=False),
        sa.Column('created_by', sa.String(length=255), autoincrement=False, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), autoincrement=False, nullable=True),
        sa.Column('updated_by', sa.String(length=255), autoincrement=False, nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), autoincrement=False, nullable=True),
        sa.Column('is_deleted', sa.Boolean(), autoincrement=False, nullable=False),
        sa.Column('pk', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
        sa.PrimaryKeyConstraint('id', 'pk'),
        sqlite_autoincrement=True
    )

    op.bulk_insert(indigenous_consultation_levels, [
        {
            "name": "PIN",
            "description": "PIN means they have a legal right in regards to this work",
            "sort_order": 1,
            "is_active": True
        },
        {
            "name": "Consult",
            "description": "Consult means they have no legal right but are kept informed anyway to maintain relationships",
            "sort_order": 2,
            "is_active": True
        },
        {
            "name": "Metis",
            "description": "Metis are only relevant to Federally linked Works (for substituted & coordinated etc.)",
            "sort_order": 3,
            "is_active": True
        },
        {
            "name": "Other",
            "description": "Other is to catch unforeseen future needs",
            "sort_order": 4,
            "is_active": True
        }
    ])

    op.add_column('indigenous_works', sa.Column('indigenous_consultation_level_id', sa.Integer(), nullable=True),
                  schema=None)
    op.create_foreign_key('fk_indigenous_consultation_level_id', 'indigenous_works', 'indigenous_consultation_levels',
                          ['indigenous_consultation_level_id'],
                          ['id'])

    op.execute(
        "UPDATE indigenous_works SET indigenous_consultation_level_id = (SELECT id FROM indigenous_consultation_levels WHERE name = 'PIN') WHERE pin = 'Yes'"
    )
    op.execute(
        "UPDATE indigenous_works SET indigenous_consultation_level_id = (SELECT id FROM indigenous_consultation_levels WHERE name = 'Other') WHERE pin != 'Yes' or pin is Null"
    )
    op.alter_column('indigenous_works', 'indigenous_consultation_level_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)

    with op.batch_alter_table('indigenous_works_history', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('indigenous_consultation_level_id', sa.Integer(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('fk_history_indigenous_consultation_level_id', 'indigenous_consultation_levels', ['indigenous_consultation_level_id'],
                                    ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('indigenous_works_history', schema=None) as batch_op:
        batch_op.drop_constraint('fk_history_indigenous_consultation_level_id', type_='foreignkey')
        batch_op.drop_column('indigenous_consultation_level_id')

    with op.batch_alter_table('indigenous_works', schema=None) as batch_op:
        batch_op.drop_constraint('fk_indigenous_consultation_level_id', type_='foreignkey')
        batch_op.drop_column('indigenous_consultation_level_id')

    op.drop_table('indigenous_consultation_levels_history')
    op.drop_table('indigenous_consultation_levels')
    # ### end Alembic commands ###
