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

from flask import current_app
from flask_restx import Namespace, Resource, cors, reqparse
from marshmallow import ValidationError

from reports_api.schemas import StaffSchema
from reports_api.services import StaffService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("staffs", description="Staffs")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument("positions", type=int, action="split", location="args")
parser.add_argument("position", type=int, location="args")

validation_parser = reqparse.RequestParser(bundle_errors=True)
validation_parser.add_argument(
    "first_name",
    type=str,
    required=True,
    location="args",
    help="first name to be checked.",
    trim=True,
)
validation_parser.add_argument(
    "last_name",
    type=str,
    required=True,
    location="args",
    help="last name to be checked.",
    trim=True,
)
validation_parser.add_argument(
    "id", type=int, help="ID of the staff in case of updates.", location="args"
)


@cors_preflight("GET")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Staffs(Resource):
    """Endpoint resource to return staffs."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @API.expect(parser)
    def get():
        """Return all active staffs."""
        current_app.logger.info("Getting staffs")
        position_id = parser.parse_args()["position"]
        current_app.logger.info(f"Position id is {position_id}")
        if position_id:
            return StaffService.find_by_position_id(position_id), HTTPStatus.OK
        positions = parser.parse_args()["positions"]
        current_app.logger.info(f"Position ids are {positions}")
        if positions:
            return StaffService.find_by_position_ids(positions), HTTPStatus.OK
        return StaffService.find_all_non_deleted_staff(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new staff"""
        staff_schema = StaffSchema()
        try:
            request_json = staff_schema.load(API.payload)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        exists = StaffService.check_existence(
            request_json.get("first_name"), request_json.get("last_name")
        )
        if exists:
            return "A staff with given name already exists.", HTTPStatus.CONFLICT
        staff = StaffService.create_staff(request_json)
        return staff_schema.dump(staff), HTTPStatus.CREATED


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:staff_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Staff(Resource):
    """Endpoint resource to return staff details."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(staff_id):
        """Return a staff detail based on id."""
        staff = StaffService.find_by_id(staff_id)
        if staff:
            return staff, HTTPStatus.OK
        return f"Staff with id '{staff_id}' not found", HTTPStatus.NOT_FOUND

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(staff_id):
        """Update and return a staff."""
        staff_schema = StaffSchema()
        try:
            request_json = staff_schema.load(API.payload)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        exists = StaffService.check_existence(
            request_json.get("first_name"), request_json.get("last_name"), staff_id
        )
        if exists:
            return "A staff with given name already exists.", HTTPStatus.CONFLICT
        staff = StaffService.update_staff(staff_id, request_json)
        return staff_schema.dump(staff), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(staff_id):
        """Delete a staff"""
        StaffService.delete_staff(staff_id)
        return {"message": "Staff successfully deleted"}, HTTPStatus.OK


@cors_preflight("GET")
@API.route("/positions/<int:position_id>", methods=["GET", "OPTIONS"])
class StaffPosition(Resource):
    """Endpoint resource to return staffs based on position_id."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(position_id):
        """Return a staff detail based on id."""
        return StaffService.find_by_position_id(position_id), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateStaff(Resource):
    """Endpoint resource to check for existing staff."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(validation_parser)
    @profiletime
    def get():
        """Checks for existing staffs."""
        args = validation_parser.parse_args()
        first_name = args["first_name"]
        last_name = args["last_name"]
        instance_id = args["id"]
        exists = StaffService.check_existence(
            first_name=first_name, last_name=last_name, instance_id=instance_id
        )
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )
