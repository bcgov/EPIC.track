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
"""Resource for proponent endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors, reqparse
from marshmallow import ValidationError

from reports_api.schemas import ProponentSchema
from reports_api.services import ProponentService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("proponents", description="Proponent")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    "name",
    type=str,
    required=True,
    help="Name of the proponent to be checked.",
    location="args",
    trim=True,
)
parser.add_argument(
    "id", type=int, help="ID of the proponent in case of updates.", location="args"
)


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateProponent(Resource):
    """Endpoint resource to check for existing proponent."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Check for existing proponent."""
        args = parser.parse_args()
        name = args["name"]
        instance_id = args["id"]
        exists = ProponentService.check_existence(name=name, instance_id=instance_id)
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:proponent_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Proponent(Resource):
    """Endpoint resource to manage a proponent."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(proponent_id):
        """Return details of a proponent."""
        proponent = ProponentService.find_by_id(proponent_id)
        if proponent:
            return proponent, HTTPStatus.OK
        return f"Proponent with id '{proponent_id}' not found", HTTPStatus.NOT_FOUND

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(proponent_id):
        """Update and return a proponent."""
        proponent_schema = ProponentSchema()
        try:
            request_json = proponent_schema.load(API.payload)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        exists = ProponentService.check_existence(
            request_json.get("name"), proponent_id
        )
        if exists:
            return "A proponent with same name exists", HTTPStatus.CONFLICT
        proponent = ProponentService.update_proponent(proponent_id, request_json)
        return proponent_schema.dump(proponent), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(proponent_id):
        """Delete a proponent"""
        ProponentService.delete_proponent(proponent_id)
        return {"message": "proponent successfully deleted"}, HTTPStatus.OK


@cors_preflight("GET,POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Proponents(Resource):
    """Endpoint resource to return proponents."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @API.expect(parser)
    def get():
        """Return all proponents."""
        return ProponentService.find_all_proponents(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new staff"""
        proponent_schema = ProponentSchema()
        try:
            request_json = proponent_schema.load(API.payload)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        exists = ProponentService.check_existence(request_json.get("name"))
        if exists:
            return "A proponent with same name exists", HTTPStatus.CONFLICT
        proponent = ProponentService.create_proponent(request_json)
        return proponent.as_dict(), HTTPStatus.CREATED
