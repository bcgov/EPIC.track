"""Ministry model schema"""
from marshmallow import EXCLUDE

from epictrack_api.models import WorkType
from epictrack_api.schemas.base import AutoSchemaBase


class WorkTypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """WorkType model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkType
        unknown = EXCLUDE
