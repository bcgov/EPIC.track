"""convert IPE to REL

Revision ID: 04f2481b1718
Revises: 45ab34ac56aa
Create Date: 2026-02-25 10:14:37.829620

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '04f2481b1718'
down_revision = '45ab34ac56aa'
branch_labels = None
depends_on = None


def upgrade():
    # Update IPE position to REL
    op.execute(
        """
        UPDATE positions
        SET name = 'REL'
        WHERE name = 'IPE'
        """
    )


def downgrade():
    # Revert REL position back to IPE
    op.execute(
        """
        UPDATE positions
        SET name = 'IPE'
        WHERE name = 'REL'
        """
    )
