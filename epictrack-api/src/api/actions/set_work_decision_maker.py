"""Disable work start date action handler"""

from api.actions.base import ActionFactory


class SetWorkDecisionMaker(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the work decision maker"""

    def run(self, source_event, params: dict) -> None:
        """Performs the required operations"""
