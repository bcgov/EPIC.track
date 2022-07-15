"""add new events for new milestone types for each phase

Revision ID: e81a9bcad31d
Revises: b565204660f7
Create Date: 2022-07-15 09:32:09.028671

"""
from alembic import op
from flask import current_app
import sqlalchemy as sa
from sqlalchemy.sql import column,table



# revision identifiers, used by Alembic.
revision = 'e81a9bcad31d'
down_revision = 'b565204660f7'
branch_labels = None
depends_on = None


def upgrade():
    milestone_type_table = table('milestone_types',
        column('id',sa.Integer),
        column('name', sa.String),
    )

    milestones_table = table('milestones',
        column('id',sa.Integer),
        column('name', sa.String),
        column('kind', sa.String),
        column('phase_id', sa.Integer),
        column('milestone_type_id', sa.Integer),
        column('sort_order', sa.Integer),
        column('start_at', sa.Integer),
        column('duration', sa.Integer),
        column('auto', sa.Boolean),
    )

    phase_table = table('phase_codes',
        column('id',sa.Integer),
        column('name',sa.String),
    )
    # Get the connection object for executing queries
    conn = op.get_bind()

    # Get the phases excluding proponent times
    phases = conn.execute(phase_table.select().where(
        sa.not_(phase_table.c.name.ilike('proponent time%'))
    ))
    milestone_types = conn.execute(
        milestone_type_table.select()\
            .where(
                milestone_type_table.c.name.in_(('Extension', 'Suspension'))
            )
        ).fetchall()

    # Get the milestones with data issue 
    milestones_for_update = conn.execute(
        milestones_table.select()\
            .where(milestones_table.c.phase_id==8)\
            .order_by(sa.desc(milestones_table.c.id))
    ).fetchmany(2)
    milestone_to_update = dict(milestones_for_update[0].items())
    milestone_to_update['sort_order'] = milestones_for_update[1].sort_order + 1
    conn.execute(
        milestones_table.update()\
            .where(milestones_table.c.id==milestone_to_update['id'])\
            .values(**milestone_to_update)
    )
        
    milestones = []
    # Create new milestones
    for phase in phases:
        # Get the last milestone of the current phase
        last_milestone = conn.execute(milestones_table.select()\
            .where(milestones_table.c.phase_id==phase[0])\
            .order_by(sa.desc(milestones_table.c.sort_order))).first()
        last_milestone = dict(last_milestone.items())
        milestones += [{
            'name': milestone_type.name, 'phase_id': phase[0],
            'milestone_type_id': milestone_type[0], 'start_at': 0, 'duration': 0, 'auto': False,
            'sort_order': last_milestone['sort_order'] - 1, 'kind': 'EVENT'
        } for milestone_type in milestone_types]
    op.bulk_insert(milestones_table, milestones)

def downgrade():
    milestone_type_table = table('milestone_types',
        column('id',sa.Integer),
        column('name', sa.String),
    )

    milestones_table = table('milestones',
        column('id',sa.Integer),
        column('name', sa.String),
        column('kind', sa.String),
        column('phase_id', sa.Integer),
        column('milestone_type_id', sa.Integer),
        column('sort_order', sa.Integer),
        column('start_at', sa.Integer),
        column('duration', sa.Integer),
        column('auto', sa.Boolean),
    )

    # Get the connection object for executing queries
    conn = op.get_bind()
    milestone_types = conn.execute(
        milestone_type_table.select()\
            .where(
                milestone_type_table.c.name.in_(('Extension', 'Suspension'))
            )
        ).fetchall()
    milestone_type_ids = [x[0] for x in milestone_types]
    conn.execute(
        milestones_table.delete()\
            .where(milestones_table.c.milestone_type_id.in_(milestone_type_ids))
    )
