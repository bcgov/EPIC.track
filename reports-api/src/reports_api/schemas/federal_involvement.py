"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import FederalInvolvement
from reports_api.schemas.base import AutoSchemaBase


class FederalInvolvementSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """FederalInvolvement model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = FederalInvolvement
        unknown = EXCLUDE
