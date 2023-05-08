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
"""Resource for indigenous nation endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors, reqparse
from marshmallow import ValidationError
from reports_api.exceptions import ResourceExistsError

from reports_api.schemas import IndigenousNationSchema
from reports_api.services import IndigenousNationService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("indigenous_nations", description="Indigenous Nations")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    "name",
    type=str,
    required=True,
    help="Name of indigenous nation to be checked.",
    location="args",
    trim=True,
)
parser.add_argument(
    "id",
    type=int,
    help="ID of the indigenous nation in case of updates.",
    location="args",
)


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateIndigenousNation(Resource):
    """Endpoint resource to check for existing indigenous nation."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Check for existing indigenous nations."""
        args = parser.parse_args()
        name = args["name"]
        instance_id = args["id"]
        exists = IndigenousNationService.check_existence(
            name=name, instance_id=instance_id
        )
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:indigenous_nation_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class IndigenousNation(Resource):
    """Endpoint resource to manage an indigenous nation."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(indigenous_nation_id):
        """Return details of an indigenous nation."""
        indigenous_nation = IndigenousNationService.find(indigenous_nation_id)
        if indigenous_nation:
            return indigenous_nation, HTTPStatus.OK
        return (
            f"Indigenous nation with id '{indigenous_nation_id}' not found.",
            HTTPStatus.NOT_FOUND,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(indigenous_nation_id):
        """Update and return an indigenous nation."""
        indigenous_nation_schema = IndigenousNationSchema()
        try:
            request_json = indigenous_nation_schema.load(API.payload)
            indigenous_nation = IndigenousNationService.update_indigenous_nation(
                indigenous_nation_id, request_json
            )
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT

        return indigenous_nation_schema.dump(indigenous_nation), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(indigenous_nation_id):
        """Delete an indigenous nation"""
        IndigenousNationService.delete_indigenous_nation(indigenous_nation_id)
        return {"message": "Indigenous nation successfully deleted"}, HTTPStatus.OK


@cors_preflight("GET,POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class IndigenousNations(Resource):
    """Endpoint resource to return indigenous nations."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @API.expect(parser)
    def get():
        """Return all indigenous nations."""
        return IndigenousNationService.find_all_indigenous_nations(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new staff"""
        indigenous_nation_schema = IndigenousNationSchema()
        try:
            request_json = indigenous_nation_schema.load(API.payload)
            indigenous_nation = IndigenousNationService.create_indigenous_nation(
                request_json
            )
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT
        return indigenous_nation_schema.dump(indigenous_nation), HTTPStatus.CREATED
