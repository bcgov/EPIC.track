"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import EAAct
from reports_api.models.db import ma


class EAActSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAAct model schema class"""

    class Meta:
        """Meta information"""

        model = EAAct
        unknown = EXCLUDE
