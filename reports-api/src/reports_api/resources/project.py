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
"""Resource for project endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors, reqparse
from marshmallow import ValidationError

from reports_api.exceptions import ResourceExistsError
from reports_api.schemas.project import ProjectSchema
from reports_api.services import ProjectService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("projects", description="Projects")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    "name",
    type=str,
    required=True,
    help="Name of the project to be checked.",
    location="args",
    trim=True,
)
parser.add_argument(
    "id", type=int, help="ID of the project in case of updates.", location="args"
)


@cors_preflight("GET, DELETE, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Projects(Resource):
    """Endpoint resource to manage projects."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all projects."""
        return ProjectService.find_all(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new project"""
        project_schema = ProjectSchema()
        try:
            request_json = project_schema.load(API.payload)
            project = ProjectService.create_project(request_json)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT
        return project_schema.dump(project), HTTPStatus.CREATED


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:project_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Project(Resource):
    """Endpoint resource to manage a project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(project_id):
        """Return details of a project."""
        return ProjectService.find(project_id), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(project_id):
        """Update and return a project."""
        project_schema = ProjectSchema()
        try:
            request_json = project_schema.load(API.payload)
            project = ProjectService.update_project(project_id, request_json)
        except ValidationError as err:
            return err.messages, HTTPStatus.BAD_REQUEST
        except ResourceExistsError as err:
            return err.message, HTTPStatus.CONFLICT

        return project_schema.dump(project), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(project_id):
        """Delete a project"""
        ProjectService.delete_project(project_id)
        return {"message": "Project successfully deleted"}, HTTPStatus.OK


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateProject(Resource):
    """Endpoint resource to check for existing project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Checks for existing projects."""
        args = parser.parse_args()
        name = args["name"]
        instance_id = args["id"]
        exists = ProjectService.check_existence(name=name, instance_id=instance_id)
        return {"exists": exists}, HTTPStatus.OK
