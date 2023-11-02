"""Disable work start date action handler"""

from api.actions.base import ActionFactory


class SetEventDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the event date"""

    def run(self, source_event, params: dict) -> None:
        """Performs the required operations"""
