"""Ministry model schema"""
from marshmallow import EXCLUDE

from epictrack_api.models import EAAct
from epictrack_api.schemas.base import AutoSchemaBase


class EAActResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAAct model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = EAAct
        unknown = EXCLUDE
