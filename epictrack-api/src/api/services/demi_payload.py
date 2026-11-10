"""Builds the records Track pushes to DEMI."""
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import joinedload

from api.models import PRIMARY_CATEGORIES, Event, EventConfiguration, PhaseCode, Project, Work, WorkPhase, db
from api.models.phase_code import PhaseVisibilityEnum
from api.schemas.response.demi_payload import (
    DemiEventSchema, DemiProjectSchema, DemiWorkPhaseSchema, DemiWorkSchema)


PRIMARY_CATEGORY_IDS = {category.value for category in PRIMARY_CATEGORIES}
# The tables with a record of their own, parents first.
RECORD_TABLES = ("projects", "works", "work_phases", "events")


@dataclass
class DemiRecord:  # pylint: disable=too-many-instance-attributes
    """One record to send: delete, or the body of a POST or PUT."""

    kind: str
    record_id: int
    delete: bool
    project_id: int
    path_parts: tuple
    pushed_at: int
    work_type_id: Optional[int] = None
    work_id: Optional[int] = None
    work_phase_id: Optional[int] = None
    body: Optional[dict] = None


def _stamp() -> int:
    # Stamped before the state read: a commit after this read has its own push with a later stamp,
    # so older state cannot win. clock_timestamp(), since now() is frozen at transaction start.
    return db.session.execute(text("SELECT (extract(epoch FROM clock_timestamp()) * 1000)::bigint")).scalar()


def _phase_in_feed(phase) -> bool:
    return phase.is_active and not phase.is_deleted and phase.visibility != PhaseVisibilityEnum.HIDDEN


def _phase_options():
    return (
        joinedload(WorkPhase.phase).joinedload(PhaseCode.ea_act),
        joinedload(WorkPhase.phase).joinedload(PhaseCode.work_type),
    )


def _phases_and_events(work_ids):
    """Group the feed's phases by work and its primary events by phase, in DEMI's order."""
    phases = (
        WorkPhase.query.filter(
            WorkPhase.work_id.in_(work_ids),
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.visibility != PhaseVisibilityEnum.HIDDEN.value,
        )
        .options(*_phase_options())
        .order_by(WorkPhase.sort_order, WorkPhase.id)
        .all()
    )
    events = (
        Event.query.join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
        .filter(
            EventConfiguration.work_phase_id.in_([phase.id for phase in phases]),
            EventConfiguration.event_category_id.in_(PRIMARY_CATEGORY_IDS),
            Event.is_active.is_(True),
            Event.is_deleted.is_(False),
        )
        .options(joinedload(Event.event_configuration), joinedload(Event.outcome))
        .order_by(EventConfiguration.sort_order, Event.id)
        .all()
    )
    phases_by_work = defaultdict(list)
    for phase in phases:
        phases_by_work[phase.work_id].append(phase)
    events_by_phase = defaultdict(list)
    for event in events:
        events_by_phase[event.event_configuration.work_phase_id].append(event)
    return phases_by_work, events_by_phase


def _project_record(project_id, pushed_at, _nested):
    project = (
        Project.query.filter(Project.id == project_id)
        .options(
            joinedload(Project.proponent),
            joinedload(Project.sub_type),
            joinedload(Project.type),
            joinedload(Project.project_state),
        )
        .first()
    )
    if project is None:
        return None
    record = DemiRecord("project", project_id, project.is_deleted, project_id, ("projects", project_id), pushed_at)
    if not record.delete:
        record.body = {"pushedAt": pushed_at, "project": DemiProjectSchema().dump(project)}
    return record


def _work_record(work_id, pushed_at, nested):
    work = (
        Work.query.filter(Work.id == work_id)
        .options(joinedload(Work.work_type), joinedload(Work.ea_act), joinedload(Work.project))
        .first()
    )
    if work is None or work.project.is_deleted:
        return None
    record = DemiRecord(
        "work", work_id, work.is_deleted, work.project_id, ("projects", work.project_id, "works", work_id),
        pushed_at, work.work_type_id, work_id,
    )
    if not record.delete:
        context = {}
        if nested:
            phases_by_work, events_by_phase = _phases_and_events([work_id])
            context = {"phases": phases_by_work, "events": events_by_phase}
        body = DemiWorkSchema(context=context).dump(work)
        record.body = {"pushedAt": pushed_at, "workTypeId": work.work_type_id, "work": body}
    return record


def _phase_record(phase_id, pushed_at, _nested):
    phase = (
        WorkPhase.query.filter(WorkPhase.id == phase_id)
        .options(*_phase_options(), joinedload(WorkPhase.work).joinedload(Work.project))
        .first()
    )
    if phase is None or phase.work.is_deleted or phase.work.project.is_deleted:
        return None
    work = phase.work
    record = DemiRecord(
        "phase", phase_id, not _phase_in_feed(phase), work.project_id,
        ("projects", work.project_id, "phases", phase_id), pushed_at, work.work_type_id, work.id, phase_id,
    )
    if not record.delete:
        body = DemiWorkPhaseSchema().dump(phase)
        record.body = {"pushedAt": pushed_at, "workTypeId": work.work_type_id, "phase": body}
    return record


def _event_record(event_id, pushed_at, _nested):
    event = (
        Event.query.filter(Event.id == event_id)
        .options(
            joinedload(Event.event_configuration).joinedload(EventConfiguration.work_phase),
            joinedload(Event.outcome),
            joinedload(Event.work).joinedload(Work.project),
        )
        .first()
    )
    if event is None or event.event_configuration.event_category_id not in PRIMARY_CATEGORY_IDS:
        return None
    phase = event.event_configuration.work_phase
    work = event.work
    # Outside the feed the phase's own DELETE already removed the event.
    if phase is None or not _phase_in_feed(phase) or work.is_deleted or work.project.is_deleted:
        return None
    record = DemiRecord(
        "event", event_id, event.is_deleted or not event.is_active, work.project_id,
        ("projects", work.project_id, "events", event_id), pushed_at, work.work_type_id, work.id, phase.id,
    )
    if not record.delete:
        record.body = {"pushedAt": pushed_at, "workTypeId": work.work_type_id, "event": DemiEventSchema().dump(event)}
    return record


_RECORDS = {
    "projects": _project_record,
    "works": _work_record,
    "work_phases": _phase_record,
    "events": _event_record,
}


def related_rows(table: str, row_id: int) -> list:
    """Return the records a lookup row's change shows in: a proponent's projects, a template's events."""
    if table == "proponents":
        query = Project.query.filter(Project.proponent_id == row_id, Project.is_deleted.is_(False))
        return [("projects", project_id) for (project_id,) in query.with_entities(Project.id)]
    column = {"event_configurations": Event.event_configuration_id, "outcome_configurations": Event.outcome_id}.get(table)
    if column is None:
        return []
    return [("events", event_id) for (event_id,) in Event.query.filter(column == row_id).with_entities(Event.id)]


def work_ids_of(table: str, row_ids) -> dict:
    """Return each phase's or event's work id, by row id."""
    if not row_ids:
        return {}
    model = WorkPhase if table == "work_phases" else Event
    return dict(model.query.filter(model.id.in_(row_ids)).with_entities(model.id, model.work_id))


def resolve_record(table: str, record_id: int, nested: bool = False) -> Optional[DemiRecord]:
    """Return what to send for one row from its current state, or None to send nothing.

    nested adds a new work's phases and events. Reads models directly: no request, so no auth checks.
    """
    build = _RECORDS.get(table)
    if build is None:
        return None
    return build(record_id, _stamp(), nested)
