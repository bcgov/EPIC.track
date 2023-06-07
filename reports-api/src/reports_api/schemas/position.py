"""Position model schema"""
from marshmallow import EXCLUDE

from reports_api.models import Position
from reports_api.schemas.base import AutoSchemaBase


class PositionSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Position model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Position
        include_fk = True
        unknown = EXCLUDE
