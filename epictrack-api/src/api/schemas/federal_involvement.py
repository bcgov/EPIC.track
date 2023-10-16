"""Ministry model schema"""
from marshmallow import EXCLUDE

from api.models import FederalInvolvement
from api.schemas.base import AutoSchemaBase


class FederalInvolvementSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """FederalInvolvement model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = FederalInvolvement
        unknown = EXCLUDE
