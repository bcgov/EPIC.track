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
"""Resource for staff endpoints."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, cors

from reports_api.services import StaffService
from reports_api.utils.util import cors_preflight


API = Namespace('staffs', description='Staffs')


@cors_preflight('GET')
@API.route('', methods=['GET', 'OPTIONS'])
class Staffs(Resource):
    """Endpoint resource to return staffs."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Return all active staffs."""
        position_id = request.args.get('position', None)
        if position_id:
            return StaffService.find_by_position_id(position_id), HTTPStatus.OK

        return StaffService.find_all_active_staff(), HTTPStatus.OK


@API.route('/<int:_id>', methods=['GET', 'OPTIONS'])
class Staff(Resource):
    """Endpoint resource to return staff details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(_id):
        """Return a staff detail based on id."""
        return StaffService.find_by_id(_id), HTTPStatus.OK


@API.route('/positions/<int:position_id>', methods=['GET', 'OPTIONS'])
class StaffPosition(Resource):
    """Endpoint resource to return staffs based on position_id."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(position_id):
        """Return a staff detail based on id."""
        return StaffService.find_by_position_id(position_id), HTTPStatus.OK
