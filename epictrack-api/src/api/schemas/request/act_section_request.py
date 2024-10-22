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
"""Act Sections resource's input validations"""
from marshmallow import fields, validate

from .base import BasicRequestQueryParameterSchema


class ActSectionQueryParameterSchema(BasicRequestQueryParameterSchema):
    """Type id path parameter schema"""

    ea_act_id = fields.Int(
        metadata={"description": "The id of the EA Act"},
        validate=validate.Range(min=1)
    )
