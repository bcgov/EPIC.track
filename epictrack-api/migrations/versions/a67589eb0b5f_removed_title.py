"""removed title

Revision ID: a67589eb0b5f
Revises: 0ccfa4829660
Create Date: 2024-04-04 19:36:14.960046

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a67589eb0b5f'
down_revision = '0ccfa4829660'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('works', 'title')


def downgrade():
    op.add_column('works', sa.Column('title', sa.String(150), nullable=False))

