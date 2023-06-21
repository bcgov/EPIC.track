"""TaskTemplate model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Task, TaskTemplate
from reports_api.schemas.base import AutoSchemaBase


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

    tasks = fields.Nested(TaskResponseSchema, many=True, dump_only=True)
