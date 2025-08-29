"""create phase_overage_responsiblity table

Revision ID: 99af45bef1a1
Revises: 999ef9ca9bdc
Create Date: 2025-08-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '99af45bef1a1'
down_revision = '999ef9ca9bdc'
branch_labels = None
depends_on = None

overage_responsibility_enum = postgresql.ENUM("PROPONENT",
    "EAO",
    "SECONDARY_MINISTRY",
    "FEDERAL_AGENCY",
    "NATION",
    "PARTNER_AGENCY",
    name='overage_responsibility_enum', create_type=True)

def upgrade():
    op.create_table(
        'phase_overage_responsibility',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('work_phase_id', sa.Integer(), sa.ForeignKey('work_phases.id', ondelete="CASCADE"), nullable=False),
        sa.Column('responsibility', overage_responsibility_enum, nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
    )

    op.create_table(
        'phase_overage_responsibility_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('work_phase_id', sa.Integer(), sa.ForeignKey('work_phases.id', ondelete="CASCADE"), nullable=False),
        sa.Column('responsibility', overage_responsibility_enum, nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('pk', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
        sa.PrimaryKeyConstraint('id', 'pk', name='phase_overage_responsibility_history_pkey'),
    )

    op.add_column(
        "work_phases",
        sa.Column('responsibility_notes', sa.String(length=2000), nullable=True),
    )
    op.add_column(
        "work_phases_history",
        sa.Column('responsibility_notes',sa.String(length=2000), nullable=True),
    )


def downgrade():
    op.drop_table('phase_overage_responsibility_history')
    op.drop_table('phase_overage_responsibility')
    op.drop_column("work_phases", "responsibility_notes")
    op.drop_column("work_phases_history", "responsibility_notes")
    op.execute('DROP TYPE overage_responsibility_enum')
