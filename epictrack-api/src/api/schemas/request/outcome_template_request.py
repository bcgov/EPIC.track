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
"""Outcome Template resource's input validations"""
from marshmallow import fields

from .base import RequestBodyParameterSchema


class OutcomeTemplateBodyParameterSchema(RequestBodyParameterSchema):
    """EventTemplate body schema"""

    name = fields.Str(
        metadata={"description": "Name of the outcome"},
        required=True
    )

    event_template_id = fields.Int(
        metadata={"description": "template id item"},
        required=True
    )

    sort_order = fields.Int(
        metadata={"description": "Sort order of the event template item"}
    )
