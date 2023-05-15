"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import WorkType
from reports_api.models.db import ma


class WorkTypeSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """WorkType model schema class"""

    class Meta:
        """Meta information"""

        model = WorkType
        unknown = EXCLUDE
