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

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.schemas import request as req
from reports_api.schemas import response as res
from reports_api.schemas.work_type import WorkTypeSchema
from reports_api.services import ProjectService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("projects", description="Projects")


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
        projects = ProjectService.find_all()
        return (
            jsonify(res.ProjectResponseSchema(many=True).dump(projects)),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new project"""
        request_json = req.ProjectBodyParameterSchema().load(API.payload)
        project = ProjectService.create_project(request_json)
        return res.ProjectResponseSchema().dump(project), HTTPStatus.CREATED


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
        req.ProjectIdPathParameterSchema().load(request.view_args)
        project = ProjectService.find(project_id)
        return res.ProjectResponseSchema().dump(project), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(project_id):
        """Update and return a project."""
        req.ProjectIdPathParameterSchema().load(request.view_args)
        request_json = req.ProjectBodyParameterSchema().load(API.payload)
        project = ProjectService.update_project(project_id, request_json)
        return res.ProjectResponseSchema().dump(project), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(project_id):
        """Delete a project"""
        req.ProjectIdPathParameterSchema().load(request.view_args)
        ProjectService.delete_project(project_id)
        return "Project successfully deleted", HTTPStatus.OK


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateProject(Resource):
    """Endpoint resource to check for existing project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Checks for existing projects."""
        args = req.ProjectExistenceQueryParamSchema().load(request.args)
        name = args["name"]
        project_id = args["project_id"]
        exists = ProjectService.check_existence(name=name, project_id=project_id)
        return {"exists": exists}, HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<int:project_id>/work-types", methods=["GET", "OPTIONS"])
class ProjectWorkTypes(Resource):
    """Endpoint resource to get all work types associated with a project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(project_id):
        """Return work types associated with a project."""
        req.ProjectIdPathParameterSchema().load(request.view_args)
        args = req.WorkIdPathParameterSchema().load(request.args)
        work_id = args["work_id"]
        work_types = ProjectService.find_project_work_types(project_id, work_id)
        return WorkTypeSchema(many=True).dump(work_types), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<int:project_id>/first-nations", methods=["GET", "OPTIONS"])
class ProjectFirstNations(Resource):
    """Endpoint resource to get all first nations associated with a project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(project_id):
        """Return first nations associated with a project."""
        req.ProjectIdPathParameterSchema().load(request.view_args)
        args = req.ProjectFirstNationsQueryParamSchema().load(request.args)
        work_type_id = args["work_type_id"]
        work_id = args["work_id"]
        first_nations = ProjectService.find_first_nations(project_id, work_id, work_type_id)
        return res.IndigenousResponseNationSchema(many=True).dump(first_nations), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<int:project_id>/first-nation-available", methods=["GET", "OPTIONS"])
class ProjectFirstNationAvailableStatus(Resource):
    """Endpoint resource to check if there are first nations associated with a project."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(project_id):
        """Check if any first nations associated with given project."""
        req.ProjectIdPathParameterSchema().load(request.view_args)
        args = req.ProjectFirstNationsQueryParamSchema().load(request.args)
        work_id = args["work_id"]
        first_nation_availability = ProjectService.check_first_nation_available(project_id, work_id)
        return first_nation_availability, HTTPStatus.OK
