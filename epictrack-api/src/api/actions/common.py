"""Common methods for the actions"""
from datetime import datetime
from api.models import Event, EventConfiguration, WorkPhase, db
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum


def find_configuration(source_event: Event, params) -> int:
    """Find the configuration"""
    work_phase = (
        db.session.query(WorkPhase)
        .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
        .filter(
            WorkPhase.work_id == source_event.work_id,
            WorkPhase.name == params.get("phase_name"),
            PhaseCode.work_type_id == params.get("work_type_id"),
            PhaseCode.ea_act_id == params.get("ea_act_id"),
            WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
            WorkPhase.is_active.is_(True),
            PhaseCode.is_active.is_(True),
        )
        .order_by(WorkPhase.sort_order.desc())
        .first()
    )

    event_configuration = (
        db.session.query(EventConfiguration)
        .filter(
            EventConfiguration.work_phase_id == work_phase.id,
            EventConfiguration.name == params.get("event_name"),
            EventConfiguration.is_active.is_(True),
        )
        .order_by(EventConfiguration.repeat_count.desc())
        .first()
    )
    return event_configuration


def find_event_date(source_event: Event) -> datetime:
    """Returns actual date if the event has one else anticipated"""
    return (
        source_event.actual_date
        if source_event.actual_date
        else source_event.anticipated_date
    )
