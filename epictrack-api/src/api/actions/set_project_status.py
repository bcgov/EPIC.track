"""Set project status action handler"""

from api.actions.base import ActionFactory
from api.models import db
from api.models.project import Project
from api.utils import demi_marks


class SetProjectStatus(ActionFactory):  # pylint: disable=too-few-public-methods
    """Set project status action"""

    def run(self, source_event, params) -> None:
        """Sets the project's is_active status to False"""
        projects = db.session.query(Project).filter(Project.id == source_event.work.project_id)
        demi_marks.mark_rows(projects)
        projects.update({Project.is_active: params.get("is_active")})
