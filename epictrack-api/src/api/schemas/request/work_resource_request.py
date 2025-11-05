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
"""Work resource's input validations"""
from marshmallow import fields, validate

from .base import RequestQueryParameterSchema


class WorkResourceRequestSchema(RequestQueryParameterSchema):
    """Work resource request query schema"""

    work_id = fields.Int(
        metadata={"description": "The id of the work"},
        validate=validate.Range(min=1),
        load_default=None,
    )


class WorkResourceIdPathSchema(RequestQueryParameterSchema):
    """Work resource request query schema"""

    work_resource_id = fields.Int(
        metadata={"description": "The id of the work resource"},
        validate=validate.Range(min=1),
        load_default=None,
    )


class WorkResourceBodySchema(RequestQueryParameterSchema):
    """Work resource request body schema"""

    work_id = fields.Int(
        metadata={"description": "The id of the work"},
        validate=validate.Range(min=1),
        load_default=None,
    )

    title = fields.Str(
        metadata={"description": "Title of the resource"},
        required=True,
    )

    link = fields.Str(
        metadata={"description": "Link of the resource"},
        required=True,
    )


class WorkResourceUpdateBodySchema(RequestQueryParameterSchema):
    """Work resource update request body schema"""

    title = fields.Str(
        metadata={"description": "Title of the resource"},
        required=False,
        load_default=None,
    )

    link = fields.Str(
        metadata={"description": "Link of the resource"},
        required=False,
        load_default=None,
    )
