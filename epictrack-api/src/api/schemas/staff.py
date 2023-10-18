"""Staff model schema"""
from marshmallow import EXCLUDE, ValidationError, fields, validate, validates

from api.models import Staff
from api.schemas.base import AutoSchemaBase
from api.schemas.position import PositionSchema


class StaffSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staff model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Staff
        include_fk = True
        unknown = EXCLUDE

    email = fields.Str(
        required=True, validate=validate.Email(error="Not a valid email address")
    )
    full_name = fields.Method("get_full_name", dump_only=True)
    position = fields.Nested(PositionSchema, dump_only=True)

    def get_full_name(self, instance):
        """Get the full name"""
        return f"{instance.last_name}, {instance.first_name}"

    @validates("first_name")
    def validate_first_name(self, value):
        """Validates first name"""
        if not value:
            raise ValidationError("First name is required")

    @validates("last_name")
    def validate_last_name(self, value):
        """Validates last name"""
        if not value:
            raise ValidationError("Last name is required")

    @validates("phone")
    def validate_phone(self, value):
        """Validates phone number"""
        if not value:
            raise ValidationError("Phone number is required")
