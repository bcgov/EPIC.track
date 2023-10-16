"""Ministry model schema"""
from marshmallow import EXCLUDE

from api.models import WorkType
from api.schemas.base import AutoSchemaBase


class WorkTypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """WorkType model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkType
        unknown = EXCLUDE
