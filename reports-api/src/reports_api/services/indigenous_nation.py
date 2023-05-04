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
from sqlalchemy import func
from flask import jsonify
from reports_api.models import IndigenousNation


class IndigenousNationService:  # pylint: disable=too-few-public-methods
    """Service to manage indigenous nation related operations."""

    @classmethod
    def check_existence(cls, name, instance_id):
        """Checks if an indigenous nation exists with given name"""
        query = IndigenousNation.query.filter(
                    func.lower(IndigenousNation.name) == func.lower(name), IndigenousNation.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(IndigenousNation.id != instance_id)
        if query.count() > 0:
            return {"exists": True}
        return {"exists": False}

    @classmethod
    def find_all_indigenous_nations(cls):
        """Find all active indigenous nations"""
        indigenous_nations = IndigenousNation.find_all(default_filters=False)
        return jsonify({"indigenous_nations": [item.as_dict() for item in indigenous_nations]})

    @classmethod
    def find(cls, indigenous_nation_id):
        """Find by indigenous nation id."""
        return {"indigenous_nation": IndigenousNation.find_by_id(indigenous_nation_id).as_dict()}

    @classmethod
    def create_indigenous_nation(cls, payload: dict):
        """Create a new indigenous_nation."""
        indigenous_nation = IndigenousNation(**payload)
        indigenous_nation.save()
        return indigenous_nation

    @classmethod
    def update_indigenous_nation(cls, indigenous_nation_id: int, payload: dict):
        """Update existing indigenous_nation."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        del payload["responsible_epd"]
        indigenous_nation = indigenous_nation.update(payload)
        return indigenous_nation

    @classmethod
    def delete_indigenous_nation(cls, indigenous_nation_id: int):
        """Delete indigenous_nation by id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        indigenous_nation.is_deleted = True
        indigenous_nation.save()
        return True
