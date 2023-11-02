"""Disable work start date action handler"""

from api.actions.base import ActionFactory
from api.models.event import Event


class AddEvent(ActionFactory):  # pylint: disable=too-few-public-methods
    """Add a new event"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        return
