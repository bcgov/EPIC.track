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
"""Service to manage Substitution Act."""
from flask import current_app

from api.models.substitution_acts import SubstitutionAct


class SubstitutionActService:  # pylint:disable=too-few-public-methods
    """Service to manage substitution act related operations"""

    @classmethod
    def find_all(cls):
        """Find all substitution act"""
        current_app.logger.debug("find substitution act")
        substitution_acts = SubstitutionAct.find_all()
        return substitution_acts
