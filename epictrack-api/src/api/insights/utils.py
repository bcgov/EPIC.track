"""Utility functions for insights calculations."""

from api.models.db import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.event_configuration import EventConfiguration
from api.models.event import Event
from api.models.event_type import EventTypeEnum
from api.models.event_category import PRIMARY_CATEGORIES

from sqlalchemy import func, Integer, case, cast, or_, select

# Extension days subquery
def get_extension_days_subquery():
    """Returns a subquery that computes total extension days for each work_phase_id."""
    return (
        db.session.query(
            EventConfiguration.work_phase_id.label('work_phase_id'),
            func.sum(Event.number_of_days).label('extension_days')
        ).select_from(EventConfiguration)
         .join(Event, Event.event_configuration_id == EventConfiguration.id)
        .filter(
            EventConfiguration.event_type_id == EventTypeEnum.TIME_LIMIT_EXTENSION.value,
            Event.is_active.is_(True),
            Event.is_deleted.is_(False),
            EventConfiguration.is_active.is_(True),
            EventConfiguration.event_category_id.in_(list(map(lambda x: x.value, PRIMARY_CATEGORIES))),
        )
        .group_by(EventConfiguration.work_phase_id)
        .subquery()
    )

# Suspended days subquery
def get_suspended_days_subquery():
    """Returns a subquery that computes total suspended days for each work_phase_id."""
    return (
        db.session.query(
            EventConfiguration.work_phase_id.label('work_phase_id'),
            func.sum(Event.number_of_days).label('suspended_days')
        ).select_from(EventConfiguration)
        .join(Event, Event.event_configuration_id == EventConfiguration.id)
        .filter(
            EventConfiguration.event_type_id == EventTypeEnum.TIME_LIMIT_RESUMPTION.value,
            Event.actual_date.isnot(None),
            Event.is_active.is_(True),
            Event.is_deleted.is_(False),
            EventConfiguration.is_active.is_(True),
            EventConfiguration.event_category_id.in_(list(map(lambda x: x.value, PRIMARY_CATEGORIES))),
        )
        .group_by(EventConfiguration.work_phase_id)
        .subquery()
    )


def get_total_days_subquery(ext_subq):
    """Returns a subquery that computes total days for each work_phase_id."""
    subq = (
        select(
            WorkPhase.id.label("work_phase_id"),
            case(
                (
                    WorkPhase.number_of_days.isnot(None),
                    WorkPhase.number_of_days + func.coalesce(ext_subq.c.extension_days, 0)
                ),
                else_=cast(func.DATE(WorkPhase.end_date) - func.DATE(WorkPhase.start_date), Integer)
            ).label("total_days")
        )
        .select_from(WorkPhase)
        .filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value,
            ),
        )
        .join(Work, WorkPhase.work_id == Work.id)
        .join(WorkType, Work.work_type_id == WorkType.id)
        .outerjoin(ext_subq, ext_subq.c.work_phase_id == WorkPhase.id)
        .subquery()
    )
    return subq


def get_days_taken_subquery(sus_subq):
    """
    Returns a subquery that computes `days_taken` for each work_phase_id, based on the business rules.

    Includes internal subqueries for start and end dates from START/END events.
    """
    start_event_date_subq = (
        select(
            EventConfiguration.work_phase_id.label("work_phase_id"),
            func.min(Event.actual_date).label("start_date")
        ).select_from(EventConfiguration)
        .join(Event, Event.event_configuration_id == EventConfiguration.id)
        .where(EventConfiguration.event_position == "START", Event.actual_date.is_not(None))
        .group_by(EventConfiguration.work_phase_id)
        .subquery()
    )

    end_event_date_subq = (
        select(
            EventConfiguration.work_phase_id.label("work_phase_id"),
            func.max(Event.actual_date).label("end_date")
        ).select_from(EventConfiguration)
        .join(Event, Event.event_configuration_id == EventConfiguration.id)
        .where(EventConfiguration.event_position == "END", Event.actual_date.is_not(None))
        .group_by(EventConfiguration.work_phase_id)
        .subquery()
    )

    # Main subquery for days_taken
    subq = (
        select(
            WorkPhase.id.label("work_phase_id"),
            func.greatest(
                0,
                case(
                    # Completed phase: use end - start
                    (
                        WorkPhase.is_completed.is_(True),
                        func.coalesce(
                            func.date(end_event_date_subq.c.end_date) - func.date(start_event_date_subq.c.start_date),
                            0,
                        )
                    ),
                    # Current (uncompleted) phase: suspended
                    (
                        (Work.current_work_phase_id == WorkPhase.id) & WorkPhase.is_suspended.is_(True),
                        func.coalesce(
                            func.date(WorkPhase.suspended_date) - func.date(WorkPhase.start_date),
                            0
                        )
                    ),
                    # Current (uncompleted) phase: not suspended
                    (
                        (Work.current_work_phase_id == WorkPhase.id) & WorkPhase.is_suspended.is_(False),
                        func.coalesce(
                            func.date(func.now()) - func.date(WorkPhase.start_date),
                            0
                        )
                    ),
                    else_=0
                )
                - func.coalesce(sus_subq.c.suspended_days, 0)
            ).label("days_taken")
        )
        .select_from(WorkPhase)
        .join(Work, WorkPhase.work_id == Work.id)
        .join(WorkType, Work.work_type_id == WorkType.id)
        .filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value
            ),
        )
        .outerjoin(start_event_date_subq, start_event_date_subq.c.work_phase_id == WorkPhase.id)
        .outerjoin(end_event_date_subq, end_event_date_subq.c.work_phase_id == WorkPhase.id)
        .outerjoin(sus_subq, sus_subq.c.work_phase_id == WorkPhase.id)
        .subquery()
    )
    return subq


def get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq):
    """
    Returns a subquery that computes `days_left` for each work_phase_id.

    Relies on the subquery from get_days_taken_subquery (for days_taken)
    and a total_days_expr (which should resolve to the total allowed days for the phase).
    """
    subq = (
        select(
            WorkPhase.id.label("work_phase_id"),
            case(
                (
                    (work_subq.c.current_work_phase_id == WorkPhase.id) &
                    (WorkPhase.is_completed.is_(False)),
                    (total_days_subq.c.total_days - func.coalesce(sus_subq.c.suspended_days, 0)) - days_taken_subq.c.days_taken
                ),
                else_=(total_days_subq.c.total_days - func.coalesce(sus_subq.c.suspended_days, 0))
            ).label("days_left")
        )
        .select_from(WorkPhase)
        .filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value
            ),
        )
        .join(Work, WorkPhase.work_id == Work.id)
        .join(WorkType, Work.work_type_id == WorkType.id)
        .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id)
        .outerjoin(total_days_subq, total_days_subq.c.work_phase_id == WorkPhase.id)
        .outerjoin(work_subq, work_subq.c.work_phase_id == WorkPhase.id)
        .outerjoin(sus_subq, sus_subq.c.work_phase_id == WorkPhase.id)
        .distinct(WorkPhase.id)
        .subquery()
    )
    return subq


def get_work_subquery():
    """Returns a subquery that selects work_id, current_work_phase_id, and work_phase_id."""
    return (
        select(
            Work.id.label("work_id"),
            Work.current_work_phase_id.label("current_work_phase_id"),
            WorkPhase.id.label("work_phase_id"),
        )
        .select_from(WorkPhase)
        .filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value
            ),
        )
        .join(Work, WorkPhase.work_id == Work.id)
        .join(WorkType, Work.work_type_id == WorkType.id)
        .subquery()
    )
