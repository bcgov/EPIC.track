"""Utility functions for insights calculations."""

from sqlalchemy import extract

from api.models import db
from api.services.work_phase import WorkPhaseService
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.insights.insights_table_filters import build_insights_filters


def get_filtered_work_phases(filters, selected_work_type_id, selected_year=None, staff_id=None):
    """Retrieve filtered work phases based on provided filters and selected work type."""
    filter_exprs = build_insights_filters(filters, "phases") if filters else []
    selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None
    query = db.session.query(WorkPhase).join(Work, WorkPhase.work_id == Work.id)

    if selected_year:
        query = query.filter(extract('year', WorkPhase.end_date) == selected_year)

    if selected_work_type:
        query = query.filter(Work.work_type_id == selected_work_type.id)

    if filters:
        query = query.join(WorkType, Work.work_type_id == WorkType.id)
        query = query.join(Project, Work.project_id == Project.id)
        query = query.outerjoin(PhaseOverageResponsibility, WorkPhase.id == PhaseOverageResponsibility.work_phase_id)

    if staff_id:
        query = query.join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
        query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
        query = query.filter(Staff.id == staff_id)
        query = query.filter(Staff.is_active.is_(True))
        query = query.filter(StaffWorkRole.is_active.is_(True))

    query = query.filter(
        WorkPhase.is_active.is_(True),
        WorkPhase.is_deleted.is_(False),
        WorkPhase.legislated.is_(True),
        *filter_exprs if filter_exprs else [],
    )

    return query.all()


def compute_phase_overage_insights(work_phases, year=None):
    """Compute overage insights for each work phase."""
    overage_by_phase = {
        phase.phase_id: {
            "phase": phase.name,
            "count_with_overages": 0,
            "count": 0,
            "percent_overage": 0,
            "year": year,
        }
        for phase in work_phases
    }

    unique_work_ids = list(set(phase.work_id for phase in work_phases))

    for work_id in unique_work_ids:
        phases_for_work = [phase for phase in work_phases if phase.work_id == work_id]
        phase_stats = WorkPhaseService.find_work_phase_status(work_id, None, phases_for_work)
        for stats in phase_stats:
            overage_by_phase[stats["work_phase"].phase_id]["count"] += 1
            if stats["days_left"] < 0:
                overage_by_phase[stats["work_phase"].phase_id]["count_with_overages"] += 1

    for phase_id, stats in overage_by_phase.items():
        if stats["count"] > 0:
            overage_by_phase[phase_id]["percent_overage"] = round(stats["count_with_overages"] / stats["count"] * 100)
        else:
            overage_by_phase[phase_id]["percent_overage"] = 0

    return overage_by_phase
