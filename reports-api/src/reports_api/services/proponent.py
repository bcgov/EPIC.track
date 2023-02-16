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
from reports_api.models import Proponent


class ProponentService:  # pylint: disable=too-few-public-methods
    """Service to manage proponent related operations."""

    @classmethod
    def check_existence(cls, name):
        """Checks if an proponent exists with given name"""
        if Proponent.query.filter(
                    func.lower(Proponent.name) == func.lower(name), Proponent.is_deleted.is_(False)
        ).count() > 0:
            return {"exists": True}
        return {"exists": False}
