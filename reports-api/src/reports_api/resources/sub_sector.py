# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Resource for Sub Sector endpoints."""
from http import HTTPStatus
from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.services import SubSectorService
from reports_api.utils.util import cors_preflight


API = Namespace('sub-sectors', description='SubSectors')


@cors_preflight('GET')
@API.route('', methods=['GET', 'OPTIONS'])
class SubSectors(Resource):
    """Endpoint resource to return sub sectors based on sector id"""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Return all sub_sectors based on sector_id."""
        sector_id = request.args.get('sector_id', None)
        if sector_id is None:
            return jsonify({'message': 'Sector ID is missing in URL parameters'}), HTTPStatus.BAD_REQUEST
        return SubSectorService.find_by_sector_id(sector_id), HTTPStatus.OK
