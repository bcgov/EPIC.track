"""TaskTemplate model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Task, TaskTemplate
from reports_api.models.task_event import TaskEvent
from reports_api.models.task_event_assignee import TaskEventAssignee
from reports_api.schemas.base import AutoSchemaBase

from .ea_act_response import EAActResponseSchema
from .phase_response import PhaseResponseSchema
from .staff_response import StaffResponseSchema
from .work_type_response import WorkTypeResponseSchema


class TaskResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Task model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Task
        include_fk = True
        unknown = EXCLUDE


class TaskTemplateResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskTemplate model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = TaskTemplate
        include_fk = True
        unknown = EXCLUDE

    ea_act = fields.Nested(EAActResponseSchema, dump_only=True)
    work_type = fields.Nested(WorkTypeResponseSchema, dump_only=True)
    phase = fields.Nested(
        PhaseResponseSchema,
        dump_only=True,
        exclude=("ea_act", "work_type"),
    )


class TaskEventAssigneeResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskEventAssignee response schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = TaskEventAssignee
        include_fk = True
        unknown = EXCLUDE
    assignee = fields.Nested(StaffResponseSchema())


class TaskEventResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskEvent model schema class"""

    status = fields.Method("get_status_value")
    assigned = fields.Method("get_assigned_staff_names")
    responsibility = fields.Method("get_responsibility")
    assignees = fields.Nested(TaskEventAssigneeResponseSchema(), many=True, dump_only=True)

    def get_status_value(self, obj):
        """Get status value"""
        return obj.status.value

    def get_assigned_staff_names(self, obj):
        """Get assignees value"""
        assignees = list(map(lambda x: x.assignee.full_name, obj.assignees))
        assignees = sorted(assignees)
        return "; ".join(assignees)

    def get_responsibility(self, obj):
        """Get status value"""
        return obj.responsibility.name

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = TaskEvent
        include_fk = True
        unknown = EXCLUDE
