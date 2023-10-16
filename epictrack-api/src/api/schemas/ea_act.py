"""Ministry model schema"""
from marshmallow import EXCLUDE

from api.models import EAAct
from api.schemas.base import AutoSchemaBase


class EAActSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAAct model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = EAAct
        unknown = EXCLUDE
