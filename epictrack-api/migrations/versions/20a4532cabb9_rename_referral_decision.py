"""rename referral decision

Revision ID: 20a4532cabb9
Revises: e641f8414e25
Create Date: 2023-05-31 15:27:34.784655

"""
from alembic import op
import sqlalchemy as sa
from epictrack_api.models import PhaseCode


# revision identifiers, used by Alembic.
revision = '20a4532cabb9'
down_revision = 'e641f8414e25'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("Update phase_codes set name='EA Certificate Decision' where name='Referral/Decision'")


def downgrade():
    pass
