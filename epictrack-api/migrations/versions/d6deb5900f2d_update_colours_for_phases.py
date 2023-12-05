"""update colours for phases

Revision ID: d6deb5900f2d
Revises: 03791c319e2b
Create Date: 2023-12-05 12:16:10.490246

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd6deb5900f2d'
down_revision = '03791c319e2b'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update phase_codes set color='#49747B' where name='Early Engagement'")
    op.execute("Update phase_codes set color='#6D7274' where name='Proponent: DPD Development'")
    op.execute("Update phase_codes set color='#C1382E' where name='Readiness Decision'")
    op.execute("Update phase_codes set color='#043673' where name='Process Planning '")
    op.execute("Update phase_codes set color='#6D7274' where name='Proponent: Application Development '")
    op.execute("Update phase_codes set color='#2D71A9' where name='Application Review'")
    op.execute("Update phase_codes set color='#6D7274' where name='Proponent: Revised Application Development '")
    op.execute("Update phase_codes set color='#906A0C' where name='Effects Assessment & Recommendation'")
    op.execute("Update phase_codes set color='#6A54A3' where name='Decision'")
    op.execute("Update phase_codes set color='#003366' where name='Submission Review'")


def downgrade():
    pass
