"""more actions

Revision ID: eacb66ae668b
Revises: 14cebe9c6b1f
Create Date: 2023-11-20 13:17:49.673196

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eacb66ae668b'
down_revision = '14cebe9c6b1f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("INSERT INTO actions(name)VALUES('ChangePhaseEndEvent')")
    op.execute("INSERT INTO actions(name)VALUES('SetFederalInvolvement')")
    op.execute("INSERT INTO actions(name)VALUES('SetProjectState')")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    pass

    # ### end Alembic commands ###
