"""Phase Overage Responsibility response schema"""
from marshmallow import EXCLUDE, fields

from api.schemas.base import AutoSchemaBase
from api.models.phase_overage_responsibility import PhaseOverageResponsibility


class PhaseOverageResponsibilityResponseSchema(
     AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Phase Overages Responsibility model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = PhaseOverageResponsibility
        include_fk = True
        unknown = EXCLUDE

    responsibility = fields.Method("get_responsibility")

    def get_responsibility(self, obj):
        """Get enum value"""
        return obj.responsibility.value if obj.responsibility else None
