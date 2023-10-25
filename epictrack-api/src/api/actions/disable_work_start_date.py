"""Disable work start date action handler"""

from api.actions.base import ActionBase
from api.models import db
from api.models.work import Work


class DisableWorkStartDate(ActionBase):  # pylint: disable=too-few-public-methods
    """Disable work start date action"""

    def run(self, params: dict) -> None:
        """Performs the required operations"""
        work_id = params.pop("work_id")
        db.session.query(Work).filter(Work.id == work_id).update(params)
        db.session.commit()
