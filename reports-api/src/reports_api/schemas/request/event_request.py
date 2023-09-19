"""Event resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema


class MilestoneEventBodyParameterSchema(RequestBodyParameterSchema):
    """TaskTemplate request body schema"""

    name = fields.Str(
        metadata={"description": "Name of milestone event"},
        validate=validate.Length(max=150),
        required=True,
    )

    description = fields.Str(
        metadata={"description": "Description of milestone event"},
        allow_none=True,
        validate=validate.Length(max=2000)
    )

    anticipated_date = fields.DateTime(
        metadata={"description": "Anticipated date for the milestone event"},
        required=True
    )

    actual_date = fields.DateTime(
        metadata={"description": "Actual date for the milestone event"},
        allow_none=True
    )
    number_of_days = fields.Int(
        metadata={"description": "Number of days of the milestone event"},
        validate=validate.Range(min=0)
    )

    event_configuration_id = fields.Int(
        metadata={"description": "Event configuration id of the milestone event"},
        validate=validate.Range(min=0)
    )

    outcome_id = fields.Int(
        metadata={"description": "Outcome of the decision event"},
        validate=validate.Range(min=0),
        allow_none=True
    )

    notes = fields.Str(
        metadata={"description": "Notes for the milestone event"},
    )


class MilestoneEventPathParameterSchema(RequestPathParameterSchema):
    """Milestone event path parameter schema"""

    event_id = fields.Int(
        metadata={"description": "Milestone event id"},
        validate=validate.Range(min=0),
        required=True
    )
