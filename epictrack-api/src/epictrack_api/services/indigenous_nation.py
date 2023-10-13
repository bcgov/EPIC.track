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
"""Service to manage IndigenousNation."""
from epictrack_api.exceptions import ResourceExistsError, ResourceNotFoundError
from epictrack_api.models import IndigenousNation


class IndigenousNationService:
    """Service to manage indigenous nation related operations."""

    @classmethod
    def check_existence(cls, name, indigenous_nation_id=None):
        """Checks if an indigenous nation exists with given name"""
        return IndigenousNation.check_existence(name, indigenous_nation_id)

    @classmethod
    def find_all_indigenous_nations(cls):
        """Find all active indigenous nations"""
        indigenous_nations = IndigenousNation.find_all(default_filters=False)
        return indigenous_nations

    @classmethod
    def find(cls, indigenous_nation_id):
        """Find by indigenous nation id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        if not indigenous_nation:
            raise ResourceNotFoundError(f"Indigenous nation with id '{indigenous_nation_id}' not found.")
        return indigenous_nation

    @classmethod
    def create_indigenous_nation(cls, payload: dict):
        """Create a new indigenous_nation."""
        exists = cls.check_existence(payload["name"])
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        indigenous_nation = IndigenousNation(**payload)
        indigenous_nation.save()
        return indigenous_nation

    @classmethod
    def update_indigenous_nation(cls, indigenous_nation_id: int, payload: dict):
        """Update existing indigenous_nation."""
        exists = cls.check_existence(payload["name"], indigenous_nation_id)
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        if not indigenous_nation:
            raise ResourceNotFoundError(f"Indigenous nation with id '{indigenous_nation_id}' not found")
        indigenous_nation = indigenous_nation.update(payload)
        return indigenous_nation

    @classmethod
    def delete_indigenous_nation(cls, indigenous_nation_id: int):
        """Delete indigenous_nation by id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        indigenous_nation.is_deleted = True
        indigenous_nation.save()
        return True
