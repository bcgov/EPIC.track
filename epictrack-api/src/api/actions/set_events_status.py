"""Set events status action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event

from .common import find_configuration, deactivate_calendar_events_by_configuration_ids


class SetEventsStatus(ActionFactory):
    """Set events status action"""

    def run(self, source_event, params):
        """Sets all future events to INACTIVE"""
        event_configuration_ids = []
        if isinstance(params, list):
            for event_params in params:
                event_configuration = find_configuration(source_event, event_params)
                event_configuration_ids.append(event_configuration.id)
                db.session.query(Event).filter(
                    Event.event_configuration_id == event_configuration.id
                ).update({Event.is_active: event_params.get("is_active")})
        # Deactivate all child events (Calendar events at this point) of the main event
        deactivate_calendar_events_by_configuration_ids(event_configuration_ids)
