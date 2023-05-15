"""Type and SubType model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import SubType, Type
from reports_api.models.db import ma


class TypeSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Type model schema class"""

    class Meta:
        """Meta information"""

        model = Type
        include_fk = True
        unknown = EXCLUDE


class SubTypeSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Type model schema class"""

    class Meta:
        """Meta information"""

        model = SubType
        include_fk = True
        unknown = EXCLUDE

    type = fields.Nested(TypeSchema, dump_only=True)
