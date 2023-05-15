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
"""Resource for work endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors, reqparse
from marshmallow import ValidationError
from reports_api.exceptions import ResourceExistsError
from reports_api.schemas.work_v2 import WorkSchemaV2

from reports_api.services import WorkService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("works", description="Works")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    "title",
    type=str,
    required=True,
    help="Title of the work to be checked.",
    location="args",
    trim=True,
)
parser.add_argument(
    "id", type=int, help="ID of the work in case of updates.", location="args"
)


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateWork(Resource):
    """Endpoint resource to check for existing work."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Check for existing works."""
        args = parser.parse_args()
        title = args["title"]
        instance_id = args["id"]
        exists = WorkService.check_existence(title=title, instance_id=instance_id)
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )


@cors_preflight("GET, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Works(Resource):
    """Endpoint resource to manage works."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @API.expect(parser)
    def get():
        """Return all active works."""
        return WorkService.find_all_works(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new work"""
        work_schema = WorkSchemaV2()
        try:
            request_json = work_schema.load(API.payload, partial=True)
            work = WorkService.create_work(request_json)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT
        return work_schema.dump(work), HTTPStatus.CREATED


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:work_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Work(Resource):
    """Endpoint resource to return work details."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(work_id):
        """Return a work detail based on id."""
        work = WorkService.find_by_id(work_id)
        if work:
            return work, HTTPStatus.OK
        return f"Work with id '{work_id}' not found", HTTPStatus.NOT_FOUND

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(work_id):
        """Update and return a work."""
        work_schema = WorkSchemaV2()
        try:
            request_json = work_schema.load(API.payload)
            work = WorkService.update_work(work_id, request_json)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT
        return work_schema.dump(work), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(work_id):
        """Delete a work"""
        WorkService.delete_work(work_id)
        return {"message": "Work successfully deleted"}, HTTPStatus.OK
