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
"""Service to manage SubSectors."""
from flask import current_app, jsonify

from reports_api.models import SubSector


class SubSectorService():  # pylint:disable=too-few-public-methods
    """Service to manage sub sector related operations"""

    @classmethod
    def find_by_sector_id(cls, sector_id: int):
        """Find sub sectors by sector_id"""
        current_app.logger.debug(f'find sub sectors by sector_id {sector_id}')
        sub_sectors = SubSector.find_by_sector_id(sector_id)
        return jsonify([item.as_dict() for item in sub_sectors])
