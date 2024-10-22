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
"""Outcome Configuration resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestQueryParameterSchema


class OutcomeConfigurationQueryParameterSchema(RequestQueryParameterSchema):
    """Outcome Configuration query by configuration id"""

    configuration_id = fields.Int(
        metadata={"description": "Event configuration id"},
        required=True,
        validate=validate.Range(min=1)
    )


class OutcomeConfigurationBodyParameterSchema(RequestBodyParameterSchema):
    """Outcome Configuration body schema"""

    name = fields.Str(
        metadata={"description": "Name of the outcome"},
        required=True
    )

    event_configuration_id = fields.Int(
        metadata={"description": "Configuration id item"},
        required=True
    )

    outcome_template_id = fields.Int(
        metadata={"description": "Template id correspnding to the configuration"}
    )

    sort_order = fields.Int(
        metadata={"description": "Sort order of the event template item"}
    )
