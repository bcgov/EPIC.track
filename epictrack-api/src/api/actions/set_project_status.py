"""Set project status action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.project import Project


class SetProjectStatus(ActionFactory):  # pylint: disable=too-few-public-methods
    """Set project status action"""

    def run(self) -> None:
        """Sets the project's is_active status to False"""
        db.session.query(Project).filter(
            Project.id == self.source_event.work.project_id
        ).update({"is_active": False})
        db.session.commit()

    def get_additional_params(self):
        """Returns the derived additional parameters required to perform action from templates"""
