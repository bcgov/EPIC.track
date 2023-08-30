"""Event resource's input validations"""
from marshmallow import fields, validate

from .base import RequestQueryParameterSchema


class EventConfigurationQueryParamSchema(RequestQueryParameterSchema):
    """Milestone events per work/phase query parameters"""

    work_id = fields.Int(
        metadata={"description": "Work ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Phase ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )

    mandatory = fields.Bool(
        metadata={"description": "Mandatory configurations or not"},
        missing=False
    )
