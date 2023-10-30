"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.project import Project
from api.models.event import Event


class SetProjectStatus(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the project status active/inactive"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        db.session.query(Project).filter(
            Project.id == source_event.work.project.id
        ).update(params)
        db.session.commit()

    def get_additional_params(self, params):
        return super().get_additional_params(params)
