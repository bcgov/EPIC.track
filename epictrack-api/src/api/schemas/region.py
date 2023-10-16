"""Region model schema"""
from marshmallow import EXCLUDE

from api.models import Region
from api.schemas.base import AutoSchemaBase


class RegionSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Region model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Region
        unknown = EXCLUDE
