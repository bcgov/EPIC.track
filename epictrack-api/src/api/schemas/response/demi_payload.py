"""Schemas of the records Track pushes to DEMI"""
from flask_marshmallow import Schema
from marshmallow import fields, missing

from .list_type_response import ListTypeResponseSchema


def _enum_value(value):
    return value.value if hasattr(value, "value") else value


class DemiEventConfigurationSchema(Schema):
    """The event configuration fields DEMI reads for a milestone"""

    id = fields.Int(metadata={"description": "The id of the event configuration."})
    name = fields.Str(metadata={"description": "Template name of the event."})
    event_position = fields.Function(
        lambda obj: _enum_value(obj.event_position),
        metadata={"description": "START, INTERMEDIATE or END."},
    )
    event_type_id = fields.Int(metadata={"description": "The id of the event type."})
    visibility = fields.Function(
        lambda obj: _enum_value(obj.visibility),
        metadata={"description": "Template visibility; DEMI drops HIDDEN."},
    )
    sort_order = fields.Int(metadata={"description": "Order of the event within its phase."})


class DemiEventSchema(Schema):
    """One milestone event"""

    id = fields.Int(metadata={"description": "The id of the event."})
    work_id = fields.Int(metadata={"description": "The id of the event's work."})
    work_phase_id = fields.Function(
        lambda obj: obj.event_configuration.work_phase_id,
        metadata={"description": "The id of the work phase the event belongs to."},
    )
    name = fields.Str(metadata={"description": "Name of the event."})
    anticipated_date = fields.DateTime(metadata={"description": "Anticipated date of the event."})
    actual_date = fields.DateTime(metadata={"description": "Actual date of the event."})
    number_of_days = fields.Int(metadata={"description": "Duration of the event in days."})
    outcome_name = fields.Function(
        lambda obj: obj.outcome.name if obj.outcome else None,
        metadata={"description": "Name of the event's outcome, if it has one."},
    )
    event_configuration = fields.Nested(DemiEventConfigurationSchema)


class DemiPhaseCodeSchema(Schema):
    """The phase code behind a work phase"""

    id = fields.Int(metadata={"description": "The id of the phase code."})
    name = fields.Str(metadata={"description": "Name of the phase code."})
    ea_act_id = fields.Int(metadata={"description": "The id of the phase code's EA act."})
    ea_act = fields.Nested(ListTypeResponseSchema, metadata={"description": "EA act of the phase code."})
    work_type = fields.Nested(ListTypeResponseSchema, metadata={"description": "Work type of the phase code."})


class DemiWorkPhaseSchema(Schema):
    """One phase of a work; events only inside a new work"""

    id = fields.Int(metadata={"description": "The id of the work phase."})
    work_id = fields.Int(metadata={"description": "The id of the phase's work."})
    name = fields.Str(metadata={"description": "Name of the work phase."})
    start_date = fields.DateTime(metadata={"description": "Start date of the phase."})
    end_date = fields.DateTime(metadata={"description": "End date of the phase."})
    number_of_days = fields.Int(metadata={"description": "Duration of the phase in days."})
    legislated = fields.Bool(metadata={"description": "Whether the phase is legislated."})
    sort_order = fields.Int(metadata={"description": "Order of the phase within its work."})
    is_completed = fields.Bool(metadata={"description": "Whether the phase is completed."})
    is_suspended = fields.Bool(metadata={"description": "Whether the phase is suspended."})
    suspended_date = fields.DateTime(metadata={"description": "Date the phase was suspended."})
    phase = fields.Nested(DemiPhaseCodeSchema)
    events = fields.Method("get_events")

    def get_events(self, obj):
        """Events of this phase, when the caller grouped them"""
        if "events" not in self.context:
            return missing
        return DemiEventSchema(many=True).dump(self.context["events"].get(obj.id, []))


class DemiWorkSchema(Schema):
    """One non-deleted work; phases only inside a new work"""

    id = fields.Int(metadata={"description": "The id of the work."})
    project_id = fields.Int(metadata={"description": "The id of the work's project."})
    work_type_id = fields.Int(metadata={"description": "The id of the work type."})
    work_type = fields.Nested(ListTypeResponseSchema, metadata={"description": "Type of the work."})
    simple_title = fields.Str(metadata={"description": "Short title DEMI joins into the work's title."})
    ea_act = fields.Nested(ListTypeResponseSchema, metadata={"description": "EA act of the work."})
    start_date = fields.DateTime(metadata={"description": "Start date of the work."})
    is_active = fields.Bool(metadata={"description": "Whether the work is active."})
    work_state = fields.Function(
        lambda obj: _enum_value(obj.work_state), metadata={"description": "State of the work."}
    )
    work_decision_date = fields.DateTime(metadata={"description": "Decision date of the work."})
    anticipated_decision_date = fields.DateTime(
        metadata={"description": "Anticipated decision date of the work."}
    )
    phases = fields.Method("get_phases")

    def get_phases(self, obj):
        """Phases of this work, when the caller grouped them"""
        if "phases" not in self.context:
            return missing
        schema = DemiWorkPhaseSchema(many=True, context=self.context)
        return schema.dump(self.context["phases"].get(obj.id, []))


class DemiProjectSchema(Schema):
    """The project fields DEMI maps, and nothing else"""

    id = fields.Int(metadata={"description": "The id of the project."})
    name = fields.Str(metadata={"description": "Name of the project."})
    description = fields.Str(metadata={"description": "Description of the project."})
    epic_guid = fields.Str(metadata={"description": "The id of the project on the EPIC public site."})
    latitude = fields.Str(metadata={"description": "Latitude of the project, as free text."})
    longitude = fields.Str(metadata={"description": "Longitude of the project, as free text."})
    address = fields.Str(metadata={"description": "Address of the project."})
    abbreviation = fields.Str(metadata={"description": "Abbreviation of the project."})
    is_active = fields.Bool(metadata={"description": "Whether the project is active."})
    proponent = fields.Nested(ListTypeResponseSchema, metadata={"description": "Proponent of the project."})
    sub_type = fields.Nested(ListTypeResponseSchema, metadata={"description": "Sub type of the project."})
    type = fields.Nested(ListTypeResponseSchema, metadata={"description": "Type of the project."})
    project_state = fields.Nested(ListTypeResponseSchema, metadata={"description": "State of the project."})
    ea_certificate = fields.Str(metadata={"description": "EA certificate number."})
    eac_signed = fields.Date(metadata={"description": "Date the EA certificate was signed."})
    eac_expires = fields.Date(metadata={"description": "Date the EA certificate expires."})
    works = fields.Method("get_works")

    def get_works(self, _obj):
        """Works of the project, when the caller grouped them"""
        if "works" not in self.context:
            return missing
        return DemiWorkSchema(many=True, context=self.context).dump(self.context["works"])


class DemiPayloadSchema(Schema):
    """Body of PUT /track/projects/:id on DEMI"""

    pushed_at = fields.Int(
        data_key="pushedAt",
        metadata={"description": "Postgres clock_timestamp() in epoch ms, read before state."},
    )
    project = fields.Nested(DemiProjectSchema)
