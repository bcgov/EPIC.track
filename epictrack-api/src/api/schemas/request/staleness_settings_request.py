"""Request schema for StalenessSettings"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class StalenessSettingsBodyParamSchema(RequestBodyParameterSchema):
    """StalenessSettings body parameter"""

    staleness_type = fields.Str(
        metadata={"description": "Staleness Type"},
        validate=validate.OneOf(["ISSUES", "STATUS"]),
    )

    warning_length = fields.Int(
        metadata={"description": "Warning Length"},
        validate=validate.Range(min=0),
    )

    staleness_length = fields.Int(
        metadata={"description": "Staleness Length"},
        validate=validate.Range(min=0),
    )

    is_active: bool = fields.Bool(
        default=True,
        description="Flag indicating whether the staleness setting is active",
    )


class StalenessSettingsQueryParamSchema(RequestQueryParameterSchema):
    """StalenessSettings query parameter schema"""

    staleness_type = fields.Str(
        metadata={"description": "Staleness Type"},
        validate=validate.OneOf(["ISSUES", "STATUS"]),
    )

    is_active = fields.Bool(
        metadata={"description": "Flag indicated whether to only return active staleness settings"},
    )


class StalenessSettingsIdPathParamSchema(RequestPathParameterSchema):
    """StalenessSettings path parameter schema"""

    staleness_type = fields.Str(
        metadata={"description": "Staleness Type"},
        validate=validate.OneOf(["ISSUES", "STATUS"]),
        required=True
    )
