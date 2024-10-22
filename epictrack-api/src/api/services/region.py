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
"""Region service"""

from api.models.region import Region


class RegionService:
    """Service to manage Region related operations."""

    @staticmethod
    def find_all_regions():
        """Get all regions."""
        return Region.find_all()

    @staticmethod
    def find_regions_by_type(region_type: str):
        """Get all regions by region type."""
        return Region.find_all_by_region_type(region_type)
