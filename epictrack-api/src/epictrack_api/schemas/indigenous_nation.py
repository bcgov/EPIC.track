"""Indigenous nation model schema"""
from marshmallow import EXCLUDE, fields

from epictrack_api.models import IndigenousNation
from epictrack_api.schemas.base import AutoSchemaBase
from epictrack_api.schemas.staff import StaffSchema


class IndigenousNationSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Indigenous nation schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = IndigenousNation
        include_fk = True
        unknown = EXCLUDE

    relationship_holder = fields.Nested(StaffSchema, dump_only=True, exclude=("position",))
