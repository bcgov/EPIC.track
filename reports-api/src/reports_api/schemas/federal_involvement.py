"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import FederalInvolvement
from reports_api.models.db import ma


class FederalInvolvementSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """FederalInvolvement model schema class"""

    class Meta:
        """Meta information"""

        model = FederalInvolvement
        unknown = EXCLUDE
