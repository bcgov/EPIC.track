"""Flag intake phases on the phase code

Revision ID: d600856ef5d0
Revises: 8ef7aa13abdd
Create Date: 2026-11-20 12:00:00.000000

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = 'd600856ef5d0'
down_revision = '8ef7aa13abdd'
branch_labels = None
depends_on = None

# The phase names the reports treated as intake before this flag.
INTAKE_PHASE_NAMES = (
    "CEAO's Designation Intake",
    "Extension Pre-Submission",
    "Minister's Designation Intake",
    "Notification Intake",
    "Pre-Application (Exemption Request)",
    "Pre-Application",
    "Pre-Assessment",
    "Pre-EA (EAC Assessment)",
    "SubStart Pre-Assessment",
    "Transfer Pre-Application",
)

phase_codes = sa.table("phase_codes", sa.column("name", sa.String), sa.column("is_intake", sa.Boolean))


def upgrade():
    for table in ("phase_codes", "phase_codes_history"):
        with op.batch_alter_table(table) as batch_op:
            batch_op.add_column(sa.Column("is_intake", sa.Boolean(), nullable=False, server_default=sa.false()))

    op.execute(phase_codes.update().where(phase_codes.c.name.in_(INTAKE_PHASE_NAMES)).values(is_intake=True))


def downgrade():
    for table in ("phase_codes", "phase_codes_history"):
        with op.batch_alter_table(table) as batch_op:
            batch_op.drop_column("is_intake")
