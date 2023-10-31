"""Set work state action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.work import Work, WorkStateEnum


class SetWorkState(ActionFactory):  # pylint: disable=too-few-public-methods
    """Set work state status action"""

    def run(self) -> None:
        """Sets the work as per action configuration"""
        work_state = self.get_additional_params()
        db.session.query(Work).filter(Work.id == self.source_event.work_id).update(work_state)
        db.session.commit()

    def get_additional_params(self) -> dict:
        """Returns the derived additional parameters required to perform action from templates"""
        params = self.action_configuration.additional_params
        return {"work_state": WorkStateEnum(params["work_state"])}
