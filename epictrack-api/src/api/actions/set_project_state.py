"""Sets the state of the project"""
from flask import current_app

from datetime import datetime, timezone

from api.actions.base import ActionFactory
from api.models.event import Event
from api.models.project import Project
from api.models.special_field import EntityEnum, FieldTypeEnum
from api.models.project import ProjectStateEnum
from api.services.special_field import SpecialFieldService


class SetProjectState(ActionFactory):
    """Sets the state of the project"""

    def run(self, source_event: Event, params) -> None:
        """Sets the project state using either project_state or project_state_id"""
        project = Project.find_by_id(source_event.work.project_id)

        # Support both project_state (string) and project_state_id (integer)
        project_state_id = params.get("project_state_id")

        if project_state_id is None:
            # If project_state_id not provided, try to get it from project_state string
            project_state = params.get("project_state")
            if project_state:
                try:
                    # Convert string to enum and get the id
                    project_state_id = ProjectStateEnum[project_state].value
                except KeyError as exc:
                    current_app.logger.error(
                        "Invalid project_state: %s. Must be a valid ProjectStateEnum member.",
                        project_state
                    )
                    raise ValueError(f"Invalid project_state: {project_state}") from exc

        if project_state_id is None:
            raise ValueError("Either 'project_state' or 'project_state_id' must be provided")

        project.project_state_id = project_state_id
        project.update(project.as_dict(recursive=False), commit=False)
        project_state_special_field_data = {
            "entity": EntityEnum.PROJECT.value,
            "entity_id": project.id,
            "field_name": "project_state_id",
            "field_value": project.project_state_id,
            "active_from": datetime.now(timezone.utc),
            "field_type": FieldTypeEnum.INTEGER.value,
        }
        SpecialFieldService.create_special_field_entry(
            project_state_special_field_data, commit=False, work_id=source_event.work_id
        )
