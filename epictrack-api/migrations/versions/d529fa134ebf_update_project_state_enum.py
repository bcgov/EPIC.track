"""update project state enum

Revision ID: d529fa134ebf
Revises: a6167048d8df
Create Date: 2023-11-17 12:28:26.712091

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = "d529fa134ebf"
down_revision = "a6167048d8df"
branch_labels = None
depends_on = None

old_project_state_options = (
    "UNDER_EAC_ASSESSMENT",
    "UNDER_EXEMPTION_REQUEST",
    "UNDER_AMENDMENT",
    "UNDER_DISPUTE_RESOLUTION",
    "PRE_CONSTRUCTION",
    "CONSTRUCTION",
    "OPERATION",
    "CARE_AND_MAINTENANCE",
    "DECOMMISSION",
    "UNKNOWN",
)
new_project_state_options = sorted(old_project_state_options + ("CLOSED", "UNDER_DESIGNATION"))

old_project_state = sa.Enum(*old_project_state_options, name='projectstateenum')
new_project_state = sa.Enum(*new_project_state_options, name='projectstateenum')
tmp_project_state = sa.Enum(*new_project_state_options, name='_projectstateenum')



def upgrade():
     # Create a tempoary "_project_state" type, convert and drop the "old" type
    tmp_project_state.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE projects ALTER COLUMN project_state TYPE _projectstateenum'
               ' USING project_state::text::_projectstateenum')
    op.execute('DROP TYPE projectstateenum CASCADE')
    # Create and convert to the "new" project_state type
    new_project_state.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE projects ALTER COLUMN project_state TYPE projectstateenum'
               ' USING project_state::text::projectstateenum')
    tmp_project_state.drop(op.get_bind(), checkfirst=False)



def downgrade():
    table = sa.sql.table('projects',
                   sa.Column('project_state', new_project_state, nullable=True))
    op.execute(table.update().where(table.c.project_state.in_(("CLOSED", "UNDER_DESIGNATION")))
               .values(project_state=None))
     # Create a tempoary "_project_state" type, convert and drop the "new" type
    tmp_project_state.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE projects ALTER COLUMN project_state TYPE _projectstateenum'
               ' USING project_state::text::_projectstateenum')
    op.execute('DROP TYPE projectstateenum CASCADE')
    # Create and convert to the "old" project_state type
    old_project_state.create(op.get_bind(), checkfirst=False)
    op.execute('ALTER TABLE projects ALTER COLUMN project_state TYPE projectstateenum'
               ' USING project_state::text::projectstateenum')
    tmp_project_state.drop(op.get_bind(), checkfirst=False)
