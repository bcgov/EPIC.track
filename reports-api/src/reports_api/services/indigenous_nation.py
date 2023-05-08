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
from flask import jsonify
from sqlalchemy import func
from reports_api.exceptions import ResourceExistsError

from reports_api.models import IndigenousNation
from reports_api.schemas import IndigenousNationSchema


class IndigenousNationService:
    """Service to manage indigenous nation related operations."""

    @classmethod
    def check_existence(cls, name, instance_id=None):
        """Checks if an indigenous nation exists with given name"""
        query = IndigenousNation.query.filter(
            func.lower(IndigenousNation.name) == func.lower(name),
            IndigenousNation.is_deleted.is_(False),
        )
        if instance_id:
            query = query.filter(IndigenousNation.id != instance_id)
        if query.count() > 0:
            return True
        return False

    @classmethod
    def find_all_indigenous_nations(cls):
        """Find all active indigenous nations"""
        indigenous_nations = IndigenousNation.find_all(default_filters=False)
        indigenous_nations = IndigenousNationSchema(many=True).dump(indigenous_nations)
        return jsonify({"indigenous_nations": indigenous_nations})

    @classmethod
    def find(cls, indigenous_nation_id):
        """Find by indigenous nation id."""
        response = None
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        if indigenous_nation:
            response = {
                "indigenous_nation": IndigenousNationSchema().dump(indigenous_nation)
            }
        return response

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
        indigenous_nation = indigenous_nation.update(payload)
        return indigenous_nation

    @classmethod
    def delete_indigenous_nation(cls, indigenous_nation_id: int):
        """Delete indigenous_nation by id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        indigenous_nation.is_deleted = True
        indigenous_nation.save()
        return True
