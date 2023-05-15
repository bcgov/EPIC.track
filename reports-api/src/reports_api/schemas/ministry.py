"""Ministry model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Ministry
from reports_api.models.db import ma
from reports_api.schemas.staff import StaffSchema


class MinistrySchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Ministry model schema class"""

    class Meta:
        """Meta information"""

        model = Ministry
        include_fk = True
        unknown = EXCLUDE
        exclude = ("minister",)

    minister = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
