"""Set each phase's end date to its end milestone's actual date

Revision ID: 6dc2833675c7
Revises: b2bd2c763a74
Create Date: 2026-11-20 15:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '6dc2833675c7'
down_revision = 'b2bd2c763a74'
branch_labels = None
depends_on = None


def upgrade():
    # A phase ends when its end milestone actually happened; correcting that date never updated the phase.
    # Planned ends are left alone: the app keeps extension and deadline changes on the phase, not the milestone.
    # Like other data fixes this skips work_phases_history, and DEMI gets the new dates on each phase's next save.
    op.execute("""
        WITH phase_ends AS (
            SELECT ec.work_phase_id, min(e.actual_date) AS end_at
            FROM events e
            JOIN event_configurations ec ON ec.id = e.event_configuration_id
            WHERE ec.event_position = 'END'
              AND ec.is_active
              AND NOT ec.is_deleted
              AND e.is_active
              AND NOT e.is_deleted
            GROUP BY ec.work_phase_id
            HAVING count(*) = 1
        )
        UPDATE work_phases wp
        SET end_date = pe.end_at
        FROM phase_ends pe
        WHERE pe.work_phase_id = wp.id
          AND pe.end_at IS NOT NULL
          AND wp.is_active
          AND NOT wp.is_deleted
          AND (wp.end_date IS NULL
               OR (wp.end_date AT TIME ZONE 'America/Vancouver')::date
                  <> (pe.end_at AT TIME ZONE 'America/Vancouver')::date)
    """)


def downgrade():
    # The replaced end dates aren't kept, so there is nothing to restore.
    pass
