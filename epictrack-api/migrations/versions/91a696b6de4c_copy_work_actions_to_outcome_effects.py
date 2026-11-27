"""Copy each work's actions to outcome effects

Revision ID: 91a696b6de4c
Revises: 5f07df4f6621
Create Date: 2026-11-27 10:00:00.000000

"""
import logging
from collections import Counter

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from api.workplan.work_effects import backfill_effects


# revision identifiers, used by Alembic.
revision = '91a696b6de4c'
down_revision = '5f07df4f6621'
branch_labels = None
depends_on = None

logger = logging.getLogger('alembic.runtime.migration')

# f554f142190f's function, with outcome_effects deleted before the outcomes it belongs to.
DELETE_WORK = """
    CREATE OR REPLACE FUNCTION public.delete_work(integer)
    RETURNS void
    LANGUAGE plpgsql
    AS $function$
        declare
            calendar_ids int[];
            event_configuration_ids int[];
            task_event_ids int[];
        BEGIN
            delete from staff_work_roles swr  where swr.work_id = $1;
            delete from staff_work_roles_history swrh where swrh.work_id = $1;
            delete from indigenous_works iw  where iw.work_id = $1;
            delete from indigenous_works_history iwh where iwh.work_id = $1;
            delete from work_issue_updates_history wiu where wiu.work_issue_id in (select id from work_issues where work_id = $1);
            delete from work_issue_updates wiu where wiu.work_issue_id in (select id from work_issues where work_id = $1);
            delete from work_issues wi where wi.work_id = $1;
            delete from work_issues_history wih  where wih.work_id = $1;
            delete from work_statuses ws  where ws.work_id = $1;
            delete from work_statuses_history wsh  where wsh.work_id = $1;
            select array_agg(id) into event_configuration_ids from event_configurations where work_phase_id in (select id from work_phases where work_id = $1);
            delete from events_history eh where eh.event_configuration_id = any (event_configuration_ids);
            delete from events eh where eh.event_configuration_id = any (event_configuration_ids);
            select array_agg(calendar_event_id) into calendar_ids from work_calendar_events where event_configuration_id = any (event_configuration_ids);
            raise notice 'Calendar Event Ids %', calendar_ids;
            delete from work_calendar_events_history wceh where wceh.event_configuration_id = any (event_configuration_ids);
            delete from work_calendar_events wce where wce.event_configuration_id = any (event_configuration_ids);
            delete from calendar_events_history ce where ce.id = any(calendar_ids);
            delete from calendar_events ce where ce.id = any(calendar_ids);
{effect_deletes}            delete from action_configurations_history where outcome_configuration_id in (select id from outcome_configurations where event_configuration_id = any (event_configuration_ids));
            delete from action_configurations where outcome_configuration_id in (select id from outcome_configurations where event_configuration_id = any (event_configuration_ids));
            delete from outcome_configurations_history where event_configuration_id = any (event_configuration_ids);
            delete from outcome_configurations where event_configuration_id = any (event_configuration_ids);
            delete from event_configurations_history ech where ech.work_phase_id in (select id from work_phases wp where wp.work_id = $1);
            delete from event_configurations ec  where ec.work_phase_id in (select id from work_phases wp where wp.work_id = $1);
            select array_agg(id) into task_event_ids from task_events te where te.work_phase_id in (select id from work_phases wp where wp.work_id = $1);
            delete from task_event_responsibilities_history where task_event_id = any(task_event_ids);
            delete from task_event_responsibilities where task_event_id = any(task_event_ids);
            delete from task_event_assignees_history where task_event_id = any(task_event_ids);
            delete from task_event_assignees where task_event_id = any(task_event_ids);
            delete from task_events_history te where te.id = any(task_event_ids);	
            delete from task_events te where te.id = any(task_event_ids);
            delete from work_phases_history wph where wph.work_id = $1;
            delete from work_phases wp  where wp.work_id = $1;
            delete from works_history wh where wh.id = $1;
            delete from works where id = $1;
            raise notice 'Work with ID % has been deleted', $1;
    end;
    $function$
    ;
"""
EFFECT_DELETES = (
    "            delete from outcome_effects_history where outcome_configuration_id in (select id from"
    " outcome_configurations where event_configuration_id = any (event_configuration_ids));\n"
    "            delete from outcome_effects where outcome_configuration_id in (select id from outcome_configurations"
    " where event_configuration_id = any (event_configuration_ids));\n"
)


def _columns(history):
    """The table's columns. History rows get no foreign keys or defaults, so they never block a delete."""
    def references(target):
        return [] if history else [sa.ForeignKey(target)]

    def default(value):
        return {} if history else {'server_default': value}

    return [
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=not history),
        sa.Column('outcome_configuration_id', sa.Integer(), *references('outcome_configurations.id'), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('kind', sa.String(length=50), nullable=False),
        sa.Column('target_work_phase_id', sa.Integer(), *references('work_phases.id'), nullable=True),
        sa.Column('target_event_configuration_id', sa.Integer(), *references('event_configurations.id'), nullable=True),
        sa.Column('target_template_phase_id', sa.Integer(), *references('template_phases.id'), nullable=True),
        sa.Column('target_template_event_id', sa.Integer(), *references('template_events.id'), nullable=True),
        sa.Column('params', postgresql.JSONB(), nullable=False, **default(sa.text("'{}'::jsonb"))),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True, **default(sa.func.now())),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, **default(sa.true())),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, **default(sa.false())),
    ]


def upgrade():
    op.create_table('outcome_effects', *_columns(history=False), sa.PrimaryKeyConstraint('id'))
    op.create_index('ix_outcome_effects_outcome_configuration_id', 'outcome_effects', ['outcome_configuration_id'])
    op.create_table(
        'outcome_effects_history',
        *_columns(history=True),
        sa.Column('pk', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('during', postgresql.TSTZRANGE(), nullable=True),
        sa.PrimaryKeyConstraint('id', 'pk', name='outcome_effects_history_pkey'),
    )
    op.execute(DELETE_WORK.format(effect_deletes=EFFECT_DELETES))

    issues = backfill_effects(op.get_bind())
    logger.info('Outcome effects backfilled; issues by kind: %s', dict(Counter(issue.issue for issue in issues)))


def downgrade():
    op.execute(DELETE_WORK.format(effect_deletes=''))
    op.execute("DELETE FROM migration_issues WHERE issue IN ('dropped_action', 'unresolved_action')")
    op.drop_table('outcome_effects_history')
    op.drop_index('ix_outcome_effects_outcome_configuration_id', table_name='outcome_effects')
    op.drop_table('outcome_effects')
