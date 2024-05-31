"""Event resource's input validations"""

from marshmallow import fields, validate

from api.schemas.request.custom_fields import CommaSeparatedEnumList
from api.models.event_template import EventTemplateVisibilityEnum
from .base import RequestBodyParameterSchema, RequestQueryParameterSchema


class EventConfigurationQueryParamSchema(RequestQueryParameterSchema):
    """Milestone events per work/phase query parameters"""

    work_phase_id = fields.Int(
        metadata={"description": "Work phase ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )

    visibility_modes = CommaSeparatedEnumList(
        EventTemplateVisibilityEnum, required=True
    )
    configurable = fields.Bool(
        metadata={
            "description": "If true return configurations that can be used to create more events"
        },
    )


class EventConfigurationBodyParamSchema(RequestBodyParameterSchema):
    """EventConfiguration body parameter schema"""

    name = fields.Str(
        metadata={"description": "Name of the event configuration"}, required=True
    )
    parent_id = fields.Int(
        metadata={"description": "Parent id of the configuration"}, allow_none=True
    )
    template_id = fields.Int(
        metadata={
            "description": "Id of the corresponding template of this configuration"
        },
        required=True,
    )
    event_type_id = fields.Int(
        metadata={"description": "Id of the event type"}, required=True
    )
    event_category_id = fields.Int(metadata={"description": "Id of the event category"})
    start_at = fields.Int(
        metadata={"description": "Number of days at which the event has to started"}
    )
    number_of_days = fields.Int(metadata={"description": "Number of days of the event"})
    sort_order = fields.Int(metadata={"description": "Sort order of the event"})
    visibility = fields.String(
        metadata={"description": "Indicate if the phase is visible in the work plan"},
        required=True,
    )
    work_phase_id = fields.Int(metadata={"description": "Work phase id of the event"})
    repeat_count = fields.Int(
        metadata={"description": "Repeat count of the same configuration"}
    )
