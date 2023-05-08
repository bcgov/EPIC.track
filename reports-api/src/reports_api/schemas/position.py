"""Position model schema"""
from marshmallow import EXCLUDE

from reports_api.models import Position
from reports_api.models.db import ma


class PositionSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Position model schema class"""

    class Meta:
        """Meta information"""

        model = Position
        include_fk = True
        unknown = EXCLUDE
