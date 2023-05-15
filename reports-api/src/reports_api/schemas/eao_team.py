"""EAOTeam model schema"""
from marshmallow import EXCLUDE

from reports_api.models import EAOTeam
from reports_api.models.db import ma


class EAOTeamSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAOTeam model schema class"""

    class Meta:
        """Meta information"""

        model = EAOTeam
        unknown = EXCLUDE
