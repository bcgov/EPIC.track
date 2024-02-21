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
"""Service to manage Ministry."""
from api.models import Ministry


class MinistryService:  # pylint: disable=too-few-public-methods
    """Service to manage Ministry related operations."""

    @classmethod
    def find_all(cls):
        """Return all active ministries"""
        return Ministry.find_all()
