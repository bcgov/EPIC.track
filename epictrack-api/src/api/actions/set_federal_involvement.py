"""Set federal involvement"""
from api.actions.base import ActionFactory
from api.models.event import Event
from api.models.work import Work
from api.models.federal_involvement import FederalInvolvementEnum


class SetFederalInvolvement(ActionFactory):
    """Sets the federal involvement field to None"""

    def run(self, source_event: Event, params) -> None:
        """Sets the federal involvement field to None"""
        work = Work.find_by_id(source_event.work_id)
        work.federal_involvement_id = FederalInvolvementEnum.NONE
        work.update(work.as_dict(recursive=False), commit=False)
