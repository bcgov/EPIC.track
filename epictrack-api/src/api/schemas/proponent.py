"""Proponent model schema"""
from marshmallow import EXCLUDE, fields

from api.models import Proponent
from api.schemas.base import AutoSchemaBase
from api.schemas.staff import StaffSchema


class ProponentSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Proponent model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Proponent
        include_fk = True
        unknown = EXCLUDE

    relationship_holder = fields.Nested(
        StaffSchema, dump_only=True, exclude=("position",)
    )
    # relationship_holder = fields.Pluck(StaffSchema, "full_name")
