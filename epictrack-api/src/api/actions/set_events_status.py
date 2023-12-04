"""Set events status action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event

from .common import find_configuration


class SetEventsStatus(ActionFactory):
    """Set events status action"""

    def run(self, source_event, params):
        """Sets all future events to INACTIVE"""
        if isinstance(params, list):
            for event_params in params:
                event_configuration = find_configuration(source_event, event_params)
                db.session.query(Event).filter(
                    Event.event_configuration_id == event_configuration.id
                ).update({Event.is_active: event_params.get("is_active")})
