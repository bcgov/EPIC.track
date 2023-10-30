"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.project import Project
from api.models.event import Event


class SetPhasesStatus(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets all the future phases status"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        pass

    def get_additional_params(self, params):
        return super().get_additional_params(params)
