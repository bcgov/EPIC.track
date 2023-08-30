"""Event resource's input validations"""
from marshmallow import fields, validate

from .base import RequestQueryParameterSchema, RequestBodyParameterSchema


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

class MilestoneEventBodyParameterSchema(RequestBodyParameterSchema):
    """TaskTemplate request body schema"""

    name = fields.Str(
        metadata={"description": "Name of milestone event"},
        validate=validate.Length(max=150),
        required=True,
    )

    short_description = fields.Str(
        metadata={"description": "Short description of milestone event"},
        validate=validate.Length(max=2000)
    )

    short_description = fields.Str(
        metadata={"description": "Long description of milestone event"}
    )

    anticipated_date = fields.DateTime(
        metadata={"description": "Anticipated date for the milestone event"},
        required=True
    )

    actual_date = fields.DateTime(
        metadata={"description": "Actual date for the milestone event"}
    )
    number_of_days = fields.Int(
        metadata={"description": "Number of days of the milestone event"},
        validate=validate.Range(min=0)
    )

    event_configuration_id = fields.Int(
        metadata={"description": "Event configuration id of the milestone event"},
        validate=validate.Range(min=0)
    )

    notes = fields.Str(
        metadata={"description": "Notes for the milestone event"},
    )
