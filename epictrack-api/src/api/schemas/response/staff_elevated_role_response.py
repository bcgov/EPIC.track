"""Staff Elevated Role response schema"""
from marshmallow import EXCLUDE

from api.schemas.base import AutoSchemaBase
from api.models.staff_elevated_role import StaffElevatedRole


class StaffElevatedRoleResponseSchema(
    AutoSchemaBase
): # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staff Elevated Role response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = StaffElevatedRole
        include_fk = True
        unknown = EXCLUDE
