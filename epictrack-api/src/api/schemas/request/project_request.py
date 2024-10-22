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
"""Project resource's input validations"""
from marshmallow import fields, validate

from api.schemas.validators import is_uppercase

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class ProjectBodyParameterSchema(RequestBodyParameterSchema):
    """Project request body schema"""

    name = fields.Str(
        metadata={"description": "Name of project"},
        validate=validate.Length(max=150),
        required=True,
    )
    latitude = fields.Float(
        metadata={"description": "Latitude of project location"},
        validate=validate.Range(min=-90, max=90),
        required=True,
    )
    longitude = fields.Float(
        metadata={"description": "Longitude of project location"},
        validate=validate.Range(min=-180, max=180),
        required=True,
    )

    capital_investment = fields.Int(
        metadata={"description": "Capital investment of project"},
        validate=validate.Range(min=0),
        allow_none=True,
        load_default=None,
    )
    epic_guid = fields.Str(
        metadata={"description": "EPIC GUID of project"},
        validate=validate.Length(max=150),
        allow_none=True,
        load_default=None,
    )
    ea_certificate = fields.Str(
        metadata={"description": "EA Certificate # of project"},
        validate=validate.Length(max=150),
        allow_none=True,
        load_default=None,
    )
    abbreviation = fields.Str(
        metadata={"description": "Abbreviation of the project"},
        validate=[validate.Length(max=150), is_uppercase],
        required=True,
    )
    description = fields.Str(
        metadata={"description": "Description of project"},
        validate=validate.Length(max=2000),
        required=True,
    )
    address = fields.Str(
        metadata={"description": "Location description of project"},
        validate=validate.Length(max=2000),
        allow_none=True,
        load_default=None,
    )

    proponent_id = fields.Int(
        metadata={"description": "Proponent id of the project"},
        validate=validate.Range(min=1),
        required=True
    )

    type_id = fields.Int(
        metadata={"description": "Type id of the project"},
        validate=validate.Range(min=1),
        required=True
    )

    sub_type_id = fields.Int(
        metadata={"description": "SubType id of the project"},
        validate=validate.Range(min=1),
        required=True
    )

    region_id_env = fields.Int(
        metadata={"description": "ENV Region id of the project"},
        validate=validate.Range(min=1),
        allow_none=True,
        load_default=None
    )
    region_id_flnro = fields.Int(
        metadata={"description": "NRS Region id of the project"},
        validate=validate.Range(min=1),
        allow_none=True,
        load_default=None
    )

    fte_positions_construction = fields.Int(
        metadata={"description": "FTE Positions created during construction on project"},
        validate=validate.Range(min=0),
        allow_none=True,
        load_default=None
    )

    fte_positions_operation = fields.Int(
        metadata={"description": "FTE Positions created during operation on project"},
        validate=validate.Range(min=0),
        allow_none=True,
        load_default=None
    )

    eac_signed = fields.Date(
        metadata={"description": "Date the EAC was signed on"},
        allow_none=True,
        load_default=None
    )

    eac_expires = fields.Date(
        metadata={"description": "Date the EAC expires on"},
        allow_none=True,
        load_default=None
    )

    is_active = fields.Bool(metadata={"description": "Active state of the project"})
    is_project_closed = fields.Bool(metadata={"description": "Closed state of the project"}, default=False)


class ProjectExistenceQueryParamSchema(RequestQueryParameterSchema):
    """Project existence check query parameters"""

    name = fields.Str(
        metadata={"description": "Name of the project"},
        validate=validate.Length(max=150),
        required=True
    )

    project_id = fields.Int(
        metadata={"description": "The id of the project"},
        validate=validate.Range(min=1),
        load_default=None
    )


class ProjectIdPathParameterSchema(RequestPathParameterSchema):
    """project id path parameter schema"""

    project_id = fields.Int(
        metadata={"description": "The id of the project"},
        validate=validate.Range(min=1),
        required=True
    )


class ProjectFirstNationsQueryParamSchema(RequestQueryParameterSchema):
    """Project first nations query parameters"""

    work_id = fields.Int(
        metadata={"description": "The id of the work"},
        validate=validate.Range(min=1),
        required=True
    )
    work_type_id = fields.Int(
        metadata={"description": "The id of the work type"},
        validate=validate.Range(min=1),
        load_default=None,
        allow_none=True,
        missing=None
    )


class ProjectAbbreviationParameterSchema(RequestPathParameterSchema):
    """project id path parameter schema"""

    name = fields.Str(
        metadata={"description": "Name of project"},
        validate=validate.Length(max=150),
        required=True,
    )
