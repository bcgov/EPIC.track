"""Set phases status action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.work_phase import WorkPhase


class SetPhasesStatus(ActionFactory):
    """Set phases status action"""

    def run(self):
        """Sets all future PHASEs to INACTIVE"""
        db.session.query(WorkPhase).filter(
            WorkPhase.work_id == self.source_event.work_id,
            WorkPhase.start_date >= self.source_event.actual_date
        ).update({"is_active": False})
