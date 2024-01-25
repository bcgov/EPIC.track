# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Indigenous nation resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class IndigenousNationBodyParameterSchema(RequestBodyParameterSchema):
    """IndigenousNation request body schema"""

    name = fields.Str(
        metadata={"description": "Name of indigenous nation"},
        validate=validate.Length(max=150),
        required=True,
    )

    relationship_holder_id = fields.Int(
        metadata={"description": "Relationship holder id of the indigenous nation"},
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )

    is_active = fields.Bool(
        metadata={"description": "Active state of the indigenous nation"})

    notes = fields.Str(
        metadata={"description": "Notes for the indigenous nation"},
        allow_none=True
    )

    pip_org_type_id = fields.Int(
        metadata={"description": "PIP organization type for the indigenous nation"},
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )

    pip_link = fields.Str(
        metadata={"description": "PIP site URL for indigenous nation"},
        allow_none=True,
        missing=None
    )


class IndigenousNationExistenceQueryParamSchema(RequestQueryParameterSchema):
    """IndigenousNation existance check query parameters"""

    name = fields.Str(
        metadata={"description": "Name of the indigenous nation"},
        validate=validate.Length(max=150),
        required=True
    )

    indigenous_nation_id = fields.Int(
        metadata={"description": "The id of the indigenous nation"},
        validate=validate.Range(min=1),
        missing=None
    )


class IndigenousNationIdPathParameterSchema(RequestPathParameterSchema):
    """Indigenous nation id path parameter schema"""

    indigenous_nation_id = fields.Int(
        metadata={"description": "The id of the indigenous nation"},
        validate=validate.Range(min=1),
        required=True
    )


class WorkIndigenousNationIdPathParameterSchema(RequestPathParameterSchema):
    """Work indigenous nation id path parameter schema"""

    work_nation_id = fields.Int(
        metadata={"description": "Work indigenous nation id"},
        validate=validate.Range(min=1),
        required=True
    )


class IndigenousWorkBodyParameterSchema(RequestBodyParameterSchema):
    """Indigenous work body parameter schema"""

    indigenous_nation_id = fields.Int(
        metadata={"description": "First nation ID"},
        required=True,
        validate=validate.Range(min=1)
    )

    indigenous_consultation_level_id = fields.Int(
        metadata={"description": "Indigenous Consultation level ID"},
        required=False,
        allow_none=True,
        missing=None,
        validate=validate.Range(min=1)
    )

    indigenous_category_id = fields.Int(
        metadata={"description": "Indigenous Category ID"},
        required=False,
        allow_none=True,
        missing=None,
        validate=validate.Range(min=1)
    )

    is_active = fields.Bool(
        metadata={"description": "First nation Work association is active or not"},
        required=True
    )


class WorkNationExistenceCheckQueryParamSchema(RequestQueryParameterSchema):
    """WorkNation Existence check query parameter"""

    indigenous_nation_id = fields.Int(
        metadata={"description": "First nation ID"},
        required=True,
        validate=validate.Range(min=1)
    )
    work_indigenous_nation_id = fields.Int(
        metadata={"description": "First nation ID"},
        required=False,
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )
