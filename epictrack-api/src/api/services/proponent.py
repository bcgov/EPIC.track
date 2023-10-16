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
from api.exceptions import ResourceExistsError, ResourceNotFoundError
from api.models import Proponent


class ProponentService:
    """Service to manage proponent related operations."""

    @classmethod
    def check_existence(cls, name, proponent_id=None):
        """Checks if an proponent exists with given name"""
        return Proponent.check_existence(name, proponent_id)

    @classmethod
    def find_all_proponents(cls):
        """Find all active proponent"""
        proponents = Proponent.find_all(default_filters=False)
        return proponents

    @classmethod
    def find_by_id(cls, proponent_id):
        """Find by indigenous nation id."""
        proponent = Proponent.find_by_id(proponent_id)
        if proponent:
            return proponent
        raise ResourceNotFoundError(f"Proponent with id '{proponent_id}' not found.")

    @classmethod
    def create_proponent(cls, payload: dict):
        """Create a new proponent."""
        exists = cls.check_existence(payload["name"])
        if exists:
            raise ResourceExistsError("Proponent with same name exists")
        proponent = Proponent(**payload)
        proponent.save()
        return proponent

    @classmethod
    def update_proponent(cls, proponent_id: int, payload: dict):
        """Update existing proponent."""
        exists = cls.check_existence(payload["name"], proponent_id)
        if exists:
            raise ResourceExistsError("Proponent with same name exists")
        proponent = Proponent.find_by_id(proponent_id)
        if not proponent:
            raise ResourceNotFoundError(f"Proponent with id '{proponent_id}' not found.")
        proponent = proponent.update(payload)
        return proponent

    @classmethod
    def delete_proponent(cls, proponent_id: int):
        """Delete proponent by id."""
        proponent = Proponent.find_by_id(proponent_id)
        proponent.is_deleted = True
        proponent.save()
        return True
