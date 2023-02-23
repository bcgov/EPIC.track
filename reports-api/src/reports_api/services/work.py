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
"""Service to manage Works."""
from sqlalchemy import func

from reports_api.models import Work


class WorkService:  # pylint: disable=too-few-public-methods
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, title, instance_id):
        """Checks if a work exists for a given title"""
        query = Work.query.filter(
            func.lower(Work.title) == func.lower(title), Work.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(Work.id != instance_id)
        if query.count() > 0:
            return {"exists": True}
        return {"exists": False}
