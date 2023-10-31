"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.project import Project


class SetEventsStatus(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets all the future events status"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        db.session.query(Project).filter(
            Project.id == source_event.work.project.id
        ).update(params)
        db.session.commit()

    def get_additional_params(self, params):
        """Returns additional parameter"""
        return super().get_additional_params(params)
