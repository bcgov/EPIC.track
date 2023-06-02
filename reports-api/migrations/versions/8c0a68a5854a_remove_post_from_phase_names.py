"""remove post: from phase names

Revision ID: 8c0a68a5854a
Revises: 78cea6d9f3d0
Create Date: 2023-05-30 12:51:58.889964

"""
from alembic import op
import sqlalchemy as sa


from reports_api.models import PhaseCode

# revision identifiers, used by Alembic.
revision = '8c0a68a5854a'
down_revision = '78cea6d9f3d0'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)
    phases =  session.query(PhaseCode).filter(PhaseCode.name.like("Post:%")).all()
    for phase in phases:
        phase.name = phase.name.replace("Post: ", "")
    session.commit()


def downgrade():
    pass
