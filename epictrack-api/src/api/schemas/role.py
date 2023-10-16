"""Role model schema"""
from marshmallow import EXCLUDE

from api.models import Role
from api.schemas.base import AutoSchemaBase


class RoleSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Position model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Role
        include_fk = True
        unknown = EXCLUDE
