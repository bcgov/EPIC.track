"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db, Work


class SetWorkDecisionMaker(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the work decision maker"""

    def run(self, source_event, params: dict) -> None:
        """Performs the required operations"""
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.decision_maker_position_id: params.get("position_id")}
        )
