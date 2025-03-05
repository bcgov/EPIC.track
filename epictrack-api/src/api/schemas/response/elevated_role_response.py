"""Elevated Role response"""
from marshmallow import EXCLUDE

from api.schemas.base import AutoSchemaBase
from api.models.elevated_role import ElevatedRole


class ElevatedRoleResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Elevated role response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = ElevatedRole
        unknown = EXCLUDE
