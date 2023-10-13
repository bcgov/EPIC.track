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

from flask import current_app, jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.exceptions import ResourceNotFoundError
from reports_api.schemas import request as req
from reports_api.schemas import response as res
from reports_api.services import StaffService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("staffs", description="Staffs")


@cors_preflight('GET,POST')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class Staffs(Resource):
    """Endpoint resource to return staffs."""

    @staticmethod
    @auth.require
    @cors.crossdomain(origin='*')
    @profiletime
    def get():
        """Return all active staffs."""
        current_app.logger.info('Getting staffs')
        args = req.StaffByPositionsQueryParamSchema().load(request.args)
        positions = args.get('positions')
        if not positions:
            staffs = StaffService.find_all_non_deleted_staff()
        if positions:
            current_app.logger.info(f'Position ids are {positions}')
            staffs = StaffService.find_by_position_ids(positions)
        return jsonify(res.StaffResponseSchema(many=True).dump(staffs)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def post():
        """Create new staff"""
        request_json = req.StaffBodyParameterSchema().load(API.payload)
        staff = StaffService.create_staff(request_json)
        return res.StaffResponseSchema().dump(staff), HTTPStatus.CREATED


@cors_preflight('GET, DELETE, PUT')
@API.route('/<int:staff_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
class Staff(Resource):
    """Endpoint resource to return staff details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get(staff_id):
        """Return a staff detail based on id."""
        req.StaffIdPathParameterSchema().load(request.view_args)
        staff = StaffService.find_by_id(staff_id)
        if staff:
            return res.StaffResponseSchema().dump(staff), HTTPStatus.OK
        raise ResourceNotFoundError(f'Staff with id "{staff_id}" not found')

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def put(staff_id):
        """Update and return a staff."""
        req.StaffIdPathParameterSchema().load(request.view_args)
        request_json = req.StaffBodyParameterSchema().load(API.payload)
        staff = StaffService.update_staff(staff_id, request_json)
        return res.StaffResponseSchema().dump(staff), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def delete(staff_id):
        """Delete a staff"""
        req.StaffIdPathParameterSchema().load(request.view_args)
        StaffService.delete_staff(staff_id)
        return 'Staff successfully deleted', HTTPStatus.OK


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
        args = req.StaffExistanceQueryParamSchema().load(request.args)
        email = args.get('email')
        staff_id = args.get('staff_id')
        exists = StaffService.check_existence(email=email, staff_id=staff_id)
        return (
            {'exists': exists},
            HTTPStatus.OK,
        )


@cors_preflight('GET')
@API.route('/<string:email>', methods=['GET', 'OPTIONS'])
class StaffByEmail(Resource):
    """Endpoint resource to return staff details by email."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get(email):
        """Return a staff detail based on email."""
        req.StaffEmailPathParameterSchema().load(request.view_args)
        staff = StaffService.find_by_email(email)
        if staff:
            return res.StaffResponseSchema().dump(staff), HTTPStatus.OK
        raise ResourceNotFoundError(f'Staff with email "{email}" not found')
