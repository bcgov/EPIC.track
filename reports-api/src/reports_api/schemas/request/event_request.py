"""Event resource's input validations"""
from marshmallow import fields, validate

from reports_api.schemas.request.custom_fields import IntegerList

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


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

    high_priority = fields.Bool(
        metadata={"description": "Indicate if the event is high priority"},
        load_default=False,
        allow_none=True
    )

    act_section_id = fields.Int(
        metadata={"description": "Act section id of the extension/suspension event"},
        allow_none=True
    )

    reason = fields.Str(
        metadata={"description": "Reason of the extension/suspension event"},
        allow_none=True
    )

    decision_make_id = fields.Int(
        metadata={"description": "Decision maker ID of the decision event"},
        allow_none=True
    )

    number_of_attendees = fields.Int(
        metadata={"description": "Number of attendees for open house"},
        allow_none=True
    )

    number_of_responses = fields.Int(
        metadata={"description": "Number of responses for PCP"},
        allow_none=True
    )

    topic = fields.Str(
        metadata={"description": "PCP topic"},
        allow_none=True
    )


class MilestoneEventPathParameterSchema(RequestPathParameterSchema):
    """Milestone event path parameter schema"""

    event_id = fields.Int(
        metadata={"description": "Milestone event id"},
        validate=validate.Range(min=0),
        required=True
    )


class MilestoneEventBulkDeleteQueryParamSchema(RequestQueryParameterSchema):
    """Milestone events bulk delete query parameter"""

    milestone_ids = IntegerList(metadata={"description": "comma separated milestone ids"})
