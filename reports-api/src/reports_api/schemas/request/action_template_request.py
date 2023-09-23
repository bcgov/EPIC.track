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
"""Action Template resource's input validations"""
import json
from marshmallow import fields, validate, pre_load

from .base import RequestBodyParameterSchema


class ActionTemplateBodyParameterSchema(RequestBodyParameterSchema):
    """ActionTemplate body schema"""

    action_id = fields.Int(
        metadata={"description": "Id of the action"},
        required=True
    )

    outcome_id = fields.Int(
        metadata={"description": "outcome id item"},
        required=True
    )

    additional_params = fields.Dict(
        metadata={"description": "Additional parameters for the action"}
    )

    sort_order = fields.Int(
        metadata={"description": "Sort order of the event template item"}
    )
    # @pre_load
    # def unwrap_envelope(self, data, **kwargs):
    #     data["additional_params"] = json.loads(data["additional_params"])
    #     return data