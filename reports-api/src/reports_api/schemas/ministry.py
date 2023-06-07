"""Ministry model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Ministry
from reports_api.schemas.base import AutoSchemaBase
from reports_api.schemas.staff import StaffSchema


class MinistrySchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Ministry model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Ministry
        include_fk = True
        unknown = EXCLUDE
        exclude = ("minister",)

    minister = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
