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
"""Outcome Outcome Response response schema"""
from marshmallow import EXCLUDE

from api.models import OutcomeConfiguration
from api.schemas.base import AutoSchemaBase


class OutcomeConfigurationResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Outcome configuration model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = OutcomeConfiguration
        include_fk = True
        unknown = EXCLUDE
