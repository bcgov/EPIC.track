"""Sets the state of the project"""
from api.actions.base import ActionFactory
from api.models.event import Event
from api.models.project import Project


class SetProjectState(ActionFactory):
    """Sets the state of the project"""

    def run(self, source_event: Event, params) -> None:
        """Sets the federal involvement field to None"""
        project = Project.find_by_id(source_event.work.project_id)
        project.project_state_id = params.get("project_state_id")
        project.update(project.as_dict(recursive=False), commit=False)
