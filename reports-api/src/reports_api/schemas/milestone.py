"""Milestone model schema"""
from marshmallow import EXCLUDE

from reports_api.models import Milestone
from reports_api.models.db import ma


class MilestoneSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Milestone model schema class"""

    class Meta:
        """Meta information"""

        model = Milestone
        include_fk = True
        unknown = EXCLUDE
