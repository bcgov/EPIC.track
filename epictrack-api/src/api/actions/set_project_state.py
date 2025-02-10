"""Sets the state of the project"""
from datetime import datetime, timezone
from api.actions.base import ActionFactory
from api.models.event import Event
from api.models.project import Project
from api.models.special_field import EntityEnum, FieldTypeEnum
from api.services.special_field import SpecialFieldService


class SetProjectState(ActionFactory):
    """Sets the state of the project"""

    def run(self, source_event: Event, params) -> None:
        """Sets the federal involvement field to None"""
        project = Project.find_by_id(source_event.work.project_id)
        project.project_state_id = params.get("project_state_id")
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
            project_state_special_field_data, commit=False
        )
