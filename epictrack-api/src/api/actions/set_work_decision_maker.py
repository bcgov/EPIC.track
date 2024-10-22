"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import Work
from api.exceptions import UnprocessableEntityError


# pylint: disable= import-outside-toplevel
class SetWorkDecisionMaker(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the work decision maker"""

    def run(self, source_event, params: dict) -> None:
        """Performs the required operations"""
        from api.services.staff import StaffService

        staff = StaffService.find_by_position_id(params.get("position_id")).all()
        if len(staff) == 0:
            raise UnprocessableEntityError("Could not find staff with selected designation")
        work = Work.find_by_id(source_event.work_id)
        work.decision_by_id = staff[0].id
        work.decision_maker_position_id = params.get("position_id")
        work.update(work.as_dict(recursive=False), commit=False)
