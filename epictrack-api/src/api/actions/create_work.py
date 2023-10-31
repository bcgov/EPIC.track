"""Create work action handler"""
from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db
from api.models.work_type import WorkType


class CreateWork(ActionFactory):
    """Create work action"""

    def run(self) -> None:
        """Create a new WORK: "Minister's Designation" and link to this work's Project"""
        # Importing here to avoid circular imports
        from api.services.work import WorkService  # pylint: disable=import-outside-toplevel
        work_type = (
            db.session.query(WorkType)
            .filter(
                WorkType.name == "Minister's Designation", WorkType.is_active.is_(True)
            )
            .first()
        )
        new_work = {
            "ea_act_id": self.source_event.work.ea_act_id,
            "work_type_id": work_type.id,
            "start_date": self.source_event.actual_date + timedelta(days=1),
            "project_id": self.source_event.work.project_id,
            "ministry_id": self.source_event.work.ministry_id,
            "federal_involvement_id": self.source_event.work.federal_involvement_id,
            "title": f"{self.source_event.work.project.name} - {work_type.report_title}",
            "is_active": True,
        }
        WorkService.create_work(new_work)
