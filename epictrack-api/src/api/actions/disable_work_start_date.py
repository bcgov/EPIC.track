"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.work import Work


class DisableWorkStartDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Disable work start date action"""

    def run(self) -> None:
        """Set the work start date and mark start date as locked for changes"""
        db.session.query(Work).filter(Work.id == self.source_event.work_id).update(
            {"start_date": self.source_event.actual_date, "start_date_locked": True}
        )
        db.session.commit()

    def get_additional_params(self):
        """Returns the derived additional parameters required to perform action from templates"""
