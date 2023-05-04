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
"""Service to manage Proponent."""
from sqlalchemy import func
from flask import jsonify
from reports_api.models import Proponent


class ProponentService:  # pylint: disable=too-few-public-methods
    """Service to manage proponent related operations."""

    @classmethod
    def check_existence(cls, name, instance_id):
        """Checks if an proponent exists with given name"""
        query = Proponent.query.filter(
                    func.lower(Proponent.name) == func.lower(name), Proponent.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(Proponent.id != instance_id)
        if query.count() > 0:
            return {"exists": True}
        return {"exists": False}

    @classmethod
    def find_all_proponents(cls):
        """Find all active proponent"""
        proponents = Proponent.find_all(default_filters=False)
        return jsonify({"proponents": [item.as_dict() for item in proponents]})

    @classmethod
    def find(cls, proponent_id):
        """Find by indigenous nation id."""
        return {"proponent": Proponent.find_by_id(proponent_id).as_dict()}

    @classmethod
    def create_proponent(cls, payload: dict):
        """Create a new proponent."""
        proponent = Proponent(**payload)
        proponent.save()
        return proponent

    @classmethod
    def update_proponent(cls, proponent_id: int, payload: dict):
        """Update existing proponent."""
        proponent = Proponent.find_by_id(proponent_id)
        del payload["relationship_holder"]
        proponent = proponent.update(payload)
        return proponent

    @classmethod
    def delete_proponent(cls, proponent_id: int):
        """Delete proponent by id."""
        proponent = Proponent.find_by_id(proponent_id)
        proponent.is_deleted = True
        proponent.save()
        return True
