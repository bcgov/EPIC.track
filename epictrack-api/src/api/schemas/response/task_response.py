"""TaskTemplate model schema"""
from marshmallow import EXCLUDE, fields

from api.models import Task, TaskTemplate
from api.models.task_event import TaskEvent
from api.models.task_event_assignee import TaskEventAssignee
from api.models.task_event_responsibility import TaskEventResponsibility
from api.schemas.base import AutoSchemaBase

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


class TaskEventResponsibilityResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskEventResponsibility response schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = TaskEventResponsibility
        include_fk = True
        unknown = EXCLUDE


class TaskEventResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskEvent model schema class"""

    status = fields.Method("get_status_value")
    assigned = fields.Method("get_assigned_staff_names")
    responsibility = fields.Method("get_responsibility_names")
    assignees = fields.Nested(TaskEventAssigneeResponseSchema(), many=True, dump_only=True)
    responsibilities = fields.Nested(TaskEventResponsibilityResponseSchema(), many=True, dump_only=True)

    def get_status_value(self, obj):
        """Get status value"""
        return obj.status.value

    def get_assigned_staff_names(self, obj):
        """Get assignees value"""
        assignees = list(map(lambda x: f'{x.assignee.first_name} {x.assignee.last_name}', obj.assignees))
        assignees = sorted(assignees)
        return ", ".join(assignees)

    def get_responsibility_names(self, obj):
        """Get responsibility value"""
        responsibilities = list(map(lambda x: f'{x.responsibility.name}', obj.responsibilities))
        responsibilities = sorted(responsibilities)
        return ", ".join(responsibilities)

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = TaskEvent
        include_fk = True
        unknown = EXCLUDE


class TaskEventByStaffResponseSchema(
    TaskEventResponseSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """TaskEvent by Staff model schema class"""

    work = fields.Method("get_work")

    def get_work(self, obj):
        """Get work value"""
        project_name = obj.work_phase.work.project.name
        work_type_name = obj.work_phase.work.work_type.name
        simple_title = obj.work_phase.work.simple_title
        return {
            "id": obj.work_phase.work.id,
            "title": f'{project_name} - {work_type_name} - {simple_title}',
            'notes': obj.work_phase.work.first_nation_notes,
        }
