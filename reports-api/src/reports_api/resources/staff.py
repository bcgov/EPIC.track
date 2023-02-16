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

from flask import current_app, request
from flask_restx import Namespace, Resource, cors, reqparse

from reports_api.services import StaffService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace('staffs', description='Staffs')

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument("positions", type=int, action="split", location='args')
parser.add_argument("position", type=int, location='args')


@cors_preflight('GET')
@API.route('', methods=['GET', 'OPTIONS'])
class Staffs(Resource):
    """Endpoint resource to return staffs."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    @API.expect(parser)
    def get():
        """Return all active staffs."""
        current_app.logger.info("Getting staffs")
        position_id = parser.parse_args()["position"]
        current_app.logger.info(f'Position id is {position_id}')
        if position_id:
            return StaffService.find_by_position_id(position_id), HTTPStatus.OK
        positions = parser.parse_args()["positions"]
        current_app.logger.info(f'Position ids are {positions}')
        if positions:
            return StaffService.find_by_position_ids(positions), HTTPStatus.OK
        return StaffService.find_all_active_staff(), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/<int:_id>', methods=['GET', 'OPTIONS'])
class Staff(Resource):
    """Endpoint resource to return staff details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get(_id):
        """Return a staff detail based on id."""
        return StaffService.find_by_id(_id), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/positions/<int:position_id>', methods=['GET', 'OPTIONS'])
class StaffPosition(Resource):
    """Endpoint resource to return staffs based on position_id."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get(position_id):
        """Return a staff detail based on id."""
        return StaffService.find_by_position_id(position_id), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/exists', methods=['GET', 'OPTIONS'])
class ValidateStaff(Resource):
    """Endpoint resource to check for existing staff."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get():
        """Checks for existing staffs."""
        first_name = request.args.get('first_name', None)
        last_name = request.args.get('last_name', None)
        return StaffService.check_existence(first_name, last_name), HTTPStatus.OK
