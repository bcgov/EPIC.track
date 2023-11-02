"""Set work state action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.work import Work


class SetWorkState(ActionFactory):
    """Set work state status action"""

    def run(self, source_event, params) -> None:
        """Sets the work as per action configuration"""
        work_state = self.get_additional_params(params)
        db.session.query(Work).filter(Work.id == source_event.work_id).update(work_state)
        db.session.commit()

    def get_additional_params(self, params) -> dict:
        """Returns the derived additional parameters required to perform action from templates"""
        return {"work_state": params["work_state"]}
