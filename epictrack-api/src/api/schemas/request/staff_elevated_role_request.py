
"""Input validation for staff elevated role"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class StaffElevatedRoleBodyParamSchema(RequestBodyParameterSchema):
    """StaffElevatedRole body parameter"""

    staff_id = fields.Int(
        metadata={"description": "Staff ID"},
        validate=validate.Range(min=1),
    )

    elevated_role_id = fields.Int(
        metadata={"description": "Elevated Role ID"},
        validate=validate.Range(min=1),
    )

    is_active: bool = fields.Bool(
        default=True,
        description="Flag indicating whether the staff elevated role is active",
    )


class StaffElevatedRoleQueryParamSchema(RequestQueryParameterSchema):
    """StaffElevatedRole query parameter schema"""

    staff_id = fields.Int(
        metadata={"description": "Staff ID"},
        validate=validate.Range(min=1),
    )

    elevated_role_id = fields.Int(
        metadata={"description": "Elevated Role ID"},
        validate=validate.Range(min=1),
    )

    is_active = fields.Bool(
        metadata={"description": "Flag indicated whether to only return active staff elevated roles"},
    )


class StaffElevatedRoleIdPathParamSchema(RequestPathParameterSchema):
    """StaffElevatedRole path parameter schema"""

    staff_elevated_role_id = fields.Int(
        metadata={"description": "Staff Elevated Role Id"},
        validate=validate.Range(min=1),
        required=True
    )
