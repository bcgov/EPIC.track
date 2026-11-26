"""Build version 1 of each work template

Revision ID: 8013265c32c4
Revises: 14cf935ce740
Create Date: 2026-11-26 12:00:00.000000

"""
import logging

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from api.workplan.core.validation import validate_version
from api.workplan.legacy import LegacyConversionError, build_version_from_legacy, load_legacy_sets
from api.workplan.rules import get_rule_set


# revision identifiers, used by Alembic.
revision = '8013265c32c4'
down_revision = '14cf935ce740'
branch_labels = None
depends_on = None

logger = logging.getLogger('alembic.runtime.migration')

SYSTEM = 'system'
CHANGE_NOTE = 'Version 1, built from the templates uploaded before versioning.'

# Only this revision's columns, so a column added later can't break this insert.
work_templates = sa.table(
    'work_templates',
    sa.column('id', sa.Integer), sa.column('work_type_id', sa.Integer), sa.column('ea_act_id', sa.Integer),
    sa.column('name', sa.String), sa.column('created_by', sa.String),
)
work_template_versions = sa.table(
    'work_template_versions',
    sa.column('id', sa.Integer), sa.column('work_template_id', sa.Integer), sa.column('version', sa.Integer),
    sa.column('status', sa.String), sa.column('change_note', sa.Text), sa.column('published_at', sa.DateTime),
    sa.column('published_by', sa.String), sa.column('created_by', sa.String),
)
template_phases = sa.table(
    'template_phases',
    sa.column('id', sa.Integer), sa.column('template_version_id', sa.Integer), sa.column('phase_code_id', sa.Integer),
    sa.column('name', sa.String), sa.column('sort_order', sa.Integer), sa.column('time_limit_kind', sa.String),
    sa.column('number_of_days', sa.Integer), sa.column('day_basis', sa.String),
    sa.column('start_usually_set_by', sa.String), sa.column('visibility', sa.String),
    sa.column('in_default_sequence', sa.Boolean), sa.column('is_intake', sa.Boolean),
    sa.column('requires_overage_responsibility', sa.Boolean), sa.column('created_by', sa.String),
)
template_events = sa.table(
    'template_events',
    sa.column('id', sa.Integer), sa.column('template_version_id', sa.Integer),
    sa.column('template_phase_id', sa.Integer), sa.column('key', sa.Uuid), sa.column('name', sa.String),
    sa.column('event_type_id', sa.Integer), sa.column('event_category_id', sa.Integer),
    sa.column('event_position', sa.String), sa.column('role', sa.String), sa.column('visibility', sa.String),
    sa.column('anchor_template_event_id', sa.Integer), sa.column('anchor_point', sa.String),
    sa.column('offset_days', sa.Integer), sa.column('number_of_days', sa.Integer),
    sa.column('multiple_days', sa.Boolean), sa.column('repeatable', sa.Boolean),
    sa.column('sets_work_start', sa.Boolean), sa.column('sets_official_start', sa.Boolean),
    sa.column('sort_order', sa.Integer), sa.column('legacy_event_template_id', sa.Integer),
    sa.column('created_by', sa.String),
)
template_outcomes = sa.table(
    'template_outcomes',
    sa.column('id', sa.Integer), sa.column('template_event_id', sa.Integer), sa.column('name', sa.String),
    sa.column('sort_order', sa.Integer), sa.column('created_by', sa.String),
)
template_outcome_effects = sa.table(
    'template_outcome_effects',
    sa.column('id', sa.Integer), sa.column('template_outcome_id', sa.Integer), sa.column('sort_order', sa.Integer),
    sa.column('kind', sa.String), sa.column('target_template_phase_id', sa.Integer),
    sa.column('target_template_event_id', sa.Integer), sa.column('params', postgresql.JSONB),
    sa.column('created_by', sa.String),
)
TABLES_CHILD_FIRST = (
    template_outcome_effects, template_outcomes, template_events, template_phases, work_template_versions,
    work_templates,
)


def upgrade():
    build_version_one(op.get_bind())


def downgrade():
    connection = op.get_bind()
    for table in TABLES_CHILD_FIRST:
        connection.execute(table.delete())


def build_version_one(connection):
    """Publish version 1 for every legacy template set, or nothing if any of them fails."""
    built, misses = [], []
    for legacy in load_legacy_sets(connection):
        rule_set = get_rule_set(legacy.rule_set)
        try:
            version, notes = build_version_from_legacy(legacy, rule_set)
        except LegacyConversionError as error:
            misses += error.misses
            continue
        misses += [f'{legacy.name}: {problem}' for problem in validate_version(version, rule_set)]
        for note in notes:
            logger.info(note)
        built.append((legacy.name, version))
    if misses:
        raise RuntimeError('Version 1 of the work templates could not be built:\n' + '\n'.join(misses))
    for name, version in built:
        _insert(connection, name, version)


def _insert_returning_id(connection, table, **values):
    return connection.execute(table.insert().values(created_by=SYSTEM, **values).returning(table.c.id)).scalar_one()


def _insert(connection, name, version):
    template_id = _insert_returning_id(
        connection, work_templates, work_type_id=version.work_type_id, ea_act_id=version.ea_act_id, name=name,
    )
    version_id = _insert_returning_id(
        connection, work_template_versions, work_template_id=template_id, version=1, status='PUBLISHED',
        change_note=CHANGE_NOTE, published_at=sa.func.now(), published_by=SYSTEM,
    )
    phase_ids, event_ids = {}, {}
    for phase_order, phase in enumerate(version.phases, start=1):
        phase_ids[phase.phase_code_id] = _insert_returning_id(
            connection, template_phases, template_version_id=version_id, phase_code_id=phase.phase_code_id,
            name=phase.name, sort_order=phase_order, time_limit_kind=phase.time_limit_kind,
            number_of_days=phase.number_of_days, day_basis=phase.day_basis,
            start_usually_set_by=phase.start_usually_set_by, visibility=phase.visibility,
            in_default_sequence=phase.in_default_sequence, is_intake=phase.is_intake,
            requires_overage_responsibility=phase.requires_overage_responsibility,
        )
        for event_order, event in enumerate(phase.events, start=1):
            event_ids[event.key] = _insert_returning_id(
                connection, template_events, template_version_id=version_id,
                template_phase_id=phase_ids[phase.phase_code_id], key=event.key, name=event.name,
                event_type_id=event.event_type_id, event_category_id=event.event_category_id,
                event_position=event.event_position, role=event.role, visibility=event.visibility,
                anchor_point=event.anchor_point, offset_days=event.offset_days, number_of_days=event.number_of_days,
                multiple_days=event.multiple_days, repeatable=event.repeatable,
                sets_work_start=event.sets_work_start, sets_official_start=event.sets_official_start,
                sort_order=event_order, legacy_event_template_id=event.legacy_event_template_id,
            )
    for _, event in version.events():
        if event.anchor_key:
            connection.execute(
                template_events.update().where(template_events.c.id == event_ids[event.key])
                .values(anchor_template_event_id=event_ids[event.anchor_key])
            )
        for outcome_order, outcome in enumerate(event.outcomes, start=1):
            outcome_id = _insert_returning_id(
                connection, template_outcomes, template_event_id=event_ids[event.key], name=outcome.name,
                sort_order=outcome_order,
            )
            for effect_order, effect in enumerate(outcome.effects, start=1):
                _insert_returning_id(
                    connection, template_outcome_effects, template_outcome_id=outcome_id, sort_order=effect_order,
                    kind=effect.kind, target_template_phase_id=phase_ids.get(effect.target_phase_code_id),
                    target_template_event_id=event_ids.get(effect.target_event_key), params=effect.params,
                )
