"""Region model schema"""
from marshmallow import EXCLUDE

from epictrack_api.models import Region
from epictrack_api.schemas.base import AutoSchemaBase


class RegionSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Region model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Region
        unknown = EXCLUDE
