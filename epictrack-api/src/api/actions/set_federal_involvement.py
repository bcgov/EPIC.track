"""Set federal involvement"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.work import Work


class SetFederalInvolvement(ActionFactory):
    """Sets the federal involvement field to None"""

    def run(self, source_event: Event, params) -> None:
        """Sets the federal involvement field to None"""
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.federal_involvement_id: params.get("federal_involvement_id")}
        )
