"""Set events status action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event


class SetEventsStatus(ActionFactory):
    """Set events status action"""

    def run(self):
        """Sets all future events to INACTIVE"""
        db.session.query(Event).filter(
            Event.work_id == self.source_event.work_id,
            Event.anticipated_date >= self.source_event.actual_date
        ).update({"is_active": False})
