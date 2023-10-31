"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.work import Work


class LockWorkStartDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Disable work start date action"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.start_date_locked: True}
        )
        db.session.commit()

    def get_additional_params(self, params):
        """Returns additional parameter"""
        return super().get_additional_params(params)
