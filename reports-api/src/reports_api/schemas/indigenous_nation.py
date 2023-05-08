"""Indigenous nation model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import IndigenousNation
from reports_api.models.db import ma
from reports_api.schemas.staff import StaffSchema


class IndigenousNationSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Indigenous nation schema class"""

    class Meta:
        """Meta information"""

        model = IndigenousNation
        include_fk = True
        unknown = EXCLUDE

    responsible_epd = fields.Nested(StaffSchema, dump_only=True, exclude=("position",))
    # responsible_epd = fields.Pluck(StaffSchema, "full_name")
