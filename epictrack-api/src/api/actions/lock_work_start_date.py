"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.work import Work


class LockWorkStartDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Disable work start date action"""

    def run(self, source_event, params) -> None:
        """Set the work start date and mark start date as locked for changes"""
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.start_date_locked: params.get("start_date_locked")}
        )
