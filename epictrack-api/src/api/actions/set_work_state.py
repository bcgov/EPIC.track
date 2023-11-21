"""Set work state action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.work import Work


class SetWorkState(ActionFactory):
    """Set work state status action"""

    def run(self, source_event, params) -> None:
        """Sets the work as per action configuration"""
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.work_state: params.get("work_state")}
        )
