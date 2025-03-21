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
"""Ministry request schema module."""
from marshmallow import fields

from .base import RequestBodyParameterSchema


class MinistryBodyParameterSchema(RequestBodyParameterSchema):
    """Ministry request body schema"""

    name = fields.Str(
        metadata={"description": "Name of Ministry"},
        required=True,
    )

    abbreviation = fields.Str(
        metadata={"description": "Abbreviation of Ministry"},
        required=True,
    )

    minister_id = fields.Int(
        metadata={"description": "Minister ID"},
        required=True,
    )

    date_created = fields.DateTime(
        metadata={"description": "Date Created"},
        required=True,
    )

    date_closed = fields.DateTime(
        metadata={"description": "Date Closed"},
        required=False,
        allow_none=True,
    )

    sort_order = fields.Int(
        metadata={"description": "Sort Order"},
        load_default=1,
    )


class MinistryUpdateParameterSchema(RequestBodyParameterSchema):
    """Ministry request body schema"""

    date_created = fields.DateTime(
        metadata={"description": "Date Created"},
        required=True,
    )

    date_closed = fields.DateTime(
        metadata={"description": "Date Closed"},
        required=False,
        allow_none=True,
    )
