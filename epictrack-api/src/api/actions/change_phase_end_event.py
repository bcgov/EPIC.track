from api.actions.base import ActionFactory
from api.models.event import Event


class ChangePhaseEndEvent(ActionFactory):
    """Change the phase end event to another one"""

    def run(self, source_event:Event, params) -> None:
        """Change the phase end event to another one"""
        pass
    