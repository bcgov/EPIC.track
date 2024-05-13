from api.models import WorkPhase, Work, StaffWorkRole, TaskEvent, db


def find_by_staff_work_role_staff_id(staff_id: int, is_active: bool = None, session=None):
    """Find task events by staff work role id"""
    if not session:
        session = db.session
    query = session.query(TaskEvent).join(
        WorkPhase, WorkPhase.id == TaskEvent.work_phase_id
    ).join(
        Work, Work.id == WorkPhase.work_id
    ).join(
        StaffWorkRole, StaffWorkRole.work_id == Work.id
    ).filter(
        StaffWorkRole.staff_id == staff_id
    )

    if is_active is not None:
        query = query.filter(TaskEvent.is_active.is_(is_active))

    query = query.order_by(TaskEvent.start_date.asc())
    return query.all()
