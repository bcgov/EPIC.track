"""Region model schema"""
from marshmallow import EXCLUDE

from reports_api.models import Region
from reports_api.models.db import ma


class RegionSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Region model schema class"""

    class Meta:
        """Meta information"""

        model = Region
        unknown = EXCLUDE
