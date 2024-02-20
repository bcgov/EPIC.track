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
"""Service to manage Responsibilities."""
from flask import current_app

from api.models import Responsibility, db


class ResponsibilityService:  # pylint:disable=too-few-public-methods
    """Service to manage responsibility related operations"""

    @classmethod
    def find_by_id(cls, _id: int):
        """Find responsibility by id"""
        current_app.logger.debug(f"find responsibility by id {_id}")
        responsibility = Responsibility.find_by_id(_id)
        return responsibility

    @classmethod
    def find_all(cls):
        """Find all responsibilities"""
        current_app.logger.debug("find responsibilities")
        responsibilities = (
            db.session.query(Responsibility)
            .filter(
                Responsibility.is_active.is_(True), Responsibility.is_deleted.is_(False)
            )
            .all()
        )
        return responsibilities
