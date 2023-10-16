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
"""Proponent resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class ProponentBodyParameterSchema(RequestBodyParameterSchema):
    """Proponent request body schema"""

    name = fields.Str(
        metadata={"description": "Name of proponent"},
        validate=validate.Length(max=150),
        required=True,
    )

    relationship_holder_id = fields.Int(
        metadata={"description": "Relationship holder id of the proponent"},
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None,
    )

    is_active = fields.Bool(metadata={"description": "Active state of the proponent"})


class ProponentExistenceQueryParamSchema(RequestQueryParameterSchema):
    """Proponent existence check query parameters"""

    name = fields.Str(
        metadata={"description": "Name of the proponent"},
        validate=validate.Length(max=150),
        required=True,
    )

    proponent_id = fields.Int(
        metadata={"description": "The id of the proponent"},
        validate=validate.Range(min=1),
        missing=None,
    )


class ProponentIdPathParameterSchema(RequestPathParameterSchema):
    """proponent id path parameter schema"""

    proponent_id = fields.Int(
        metadata={"description": "The id of the proponent"},
        validate=validate.Range(min=1),
        required=True,
    )
