"""TaskTemplate model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Task, TaskTemplate
from reports_api.schemas.base import AutoSchemaBase

from .ea_act_response import EAActResponseSchema
from .phase_response import PhaseResponseSchema
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
        exclude=("ea_act", "work_type", "milestones"),
    )
