"""EAOTeam model schema"""
from marshmallow import EXCLUDE

from reports_api.models import EAOTeam
from reports_api.schemas.base import AutoSchemaBase


class EAOTeamSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """EAOTeam model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = EAOTeam
        unknown = EXCLUDE
