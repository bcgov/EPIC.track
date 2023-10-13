"""Type and SubType model schema"""
from marshmallow import EXCLUDE, fields

from epictrack_api.models import SubType, Type
from epictrack_api.schemas.base import AutoSchemaBase


class TypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Type model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Type
        unknown = EXCLUDE


class SubTypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Type model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = SubType
        include_fk = True
        unknown = EXCLUDE

    type = fields.Nested(TypeSchema, dump_only=True)
