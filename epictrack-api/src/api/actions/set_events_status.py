"""Set events status action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event


class SetEventsStatus(ActionFactory):
    """Set events status action"""

    def run(self, source_event, params):
        """Sets all future events to INACTIVE"""
        db.session.query(Event).filter(
            Event.work_id == source_event.work_id,
            Event.anticipated_date >= source_event.actual_date
        ).update(params)
        db.session.commit()
