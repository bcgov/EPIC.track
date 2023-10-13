"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import EAAct
from reports_api.schemas.base import AutoSchemaBase


class EAActResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAAct model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = EAAct
        unknown = EXCLUDE
