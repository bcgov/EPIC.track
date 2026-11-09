"""Builds the project payload Track pushes to DEMI."""
from collections import defaultdict
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import joinedload

from api.models import PRIMARY_CATEGORIES, Event, EventConfiguration, PhaseCode, Project, Work, WorkPhase, db
from api.models.phase_code import PhaseVisibilityEnum
from api.schemas.response.demi_payload import DemiPayloadSchema


def build_project_payload(project_id: int) -> Optional[dict]:
    """Return the PUT body for a live project, or None when it is missing or deleted.

    Queries models directly: the caller runs outside a request, so service auth checks cannot run.
    """
    # Stamped before the state read: a commit after this read has its own push with a later stamp,
    # so older state cannot win. clock_timestamp(), since now() is frozen at transaction start.
    pushed_at = db.session.execute(
        text("SELECT (extract(epoch FROM clock_timestamp()) * 1000)::bigint")
    ).scalar()

    project = (
        Project.query.filter(Project.id == project_id, Project.is_deleted.is_(False))
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

    works = (
        Work.query.filter(Work.project_id == project_id, Work.is_deleted.is_(False))
        .options(joinedload(Work.work_type), joinedload(Work.ea_act), joinedload(Work.project))
        .order_by(Work.id)
        .all()
    )
    phases = (
        WorkPhase.query.filter(
            WorkPhase.work_id.in_([work.id for work in works]),
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.visibility != PhaseVisibilityEnum.HIDDEN.value,
        )
        .options(
            joinedload(WorkPhase.phase).joinedload(PhaseCode.ea_act),
            joinedload(WorkPhase.phase).joinedload(PhaseCode.work_type),
        )
        .order_by(WorkPhase.sort_order, WorkPhase.id)
        .all()
    )
    events = (
        Event.query.join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
        .filter(
            EventConfiguration.work_phase_id.in_([phase.id for phase in phases]),
            EventConfiguration.event_category_id.in_([category.value for category in PRIMARY_CATEGORIES]),
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

    schema = DemiPayloadSchema(context={"phases": phases_by_work, "events": events_by_phase})
    return schema.dump({"pushed_at": pushed_at, "complete": True, "project": project, "works": works})
