"""Proponent model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Proponent
from reports_api.models.db import ma
from reports_api.schemas.staff import StaffSchema


class ProponentSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Proponent model schema class"""

    class Meta:
        """Meta information"""

        model = Proponent
        include_fk = True
        unknown = EXCLUDE

    relationship_holder = fields.Nested(
        StaffSchema, dump_only=True, exclude=("position",)
    )
    # relationship_holder = fields.Pluck(StaffSchema, "full_name")
