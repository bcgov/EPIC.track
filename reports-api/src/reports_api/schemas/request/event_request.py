"""Event resource's input validations"""
from marshmallow import fields, validate

from .base import RequestQueryParameterSchema


class MilestoneEventQueryParamSchema(RequestQueryParameterSchema):
    """Milestone events per work/phase query parameters"""

    work_id = fields.Int(
        metadata={"description": "Work ID for the events"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Phase ID for the events"},
        validate=validate.Range(min=1),
        required=True,
    )
