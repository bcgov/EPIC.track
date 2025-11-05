
"""Input validation for staff elevated role"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema
from api.models.phase_overage_responsibility import OverageResponsibilityEnum


class PhaseOverageResponsibilityBodyRequestSchema(RequestBodyParameterSchema):
    """Schema for creating a new phase overage responsibility"""

    work_phase_id = fields.Int(required=False)
    responsibility = fields.Str(
        required=False,
        validate=validate.OneOf([e.name for e in OverageResponsibilityEnum])
    )
    notes = fields.Str(required=False, allow_none=True, validate=validate.Length(max=2000))
    work_id = fields.Int(required=False)


class PhaseOverageResponsibilityBodyUpdateRequestSchema(RequestBodyParameterSchema):
    """Schema for updating an existing responsibility"""

    responsibility = fields.Str(
        required=True,
        validate=validate.OneOf([e.value for e in OverageResponsibilityEnum])
    )
    notes = fields.Str(required=False, allow_none=True, validate=validate.Length(max=2000))
    work_id = fields.Int(required=False)
