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

from api.schemas import request as req
from api.schemas import response as res
from api.schemas.work_type import WorkTypeSchema
from api.services import ProjectService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


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
        with_works = request.args.get(
            'with_works',
            default=False,
            type=lambda v: v.lower() == 'true'
        )
        is_active = request.args.get("is_active", None, bool)
        projects = ProjectService.find_all(with_works, is_active)
        return_type = request.args.get("return_type", None)
        if return_type == "list_type":
            schema = res.ListTypeResponseSchema(many=True)
        else:
            schema = res.ProjectResponseSchema(many=True)
        return jsonify(schema.dump(projects)), HTTPStatus.OK

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
        project = ProjectService.find(project_id, exclude_deleted=True)
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
        first_nations = ProjectService.find_first_nations(
            project_id, work_id, work_type_id
        )
        return (
            res.IndigenousResponseNationSchema(many=True).dump(first_nations),
            HTTPStatus.OK,
        )


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
        first_nation_availability = ProjectService.check_first_nation_available(
            project_id, work_id
        )
        return first_nation_availability, HTTPStatus.OK


@cors_preflight("POST")
@API.route("/import", methods=["POST", "OPTIONS"])
class ImportProjects(Resource):
    """Endpoint resource to import projects."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Import projects"""
        file = request.files["file"]
        response = ProjectService.import_projects(file)
        return response, HTTPStatus.CREATED


@cors_preflight("POST")
@API.route("/abbreviation", methods=["POST", "OPTIONS"])
class ProjectAbbreviation(Resource):
    """Endpoint resource to import projects."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new project abbreviation"""
        request_json = req.ProjectAbbreviationParameterSchema().load(API.payload)
        project_abbreviation = ProjectService.create_project_abbreviation(
            request_json.get("name")
        )
        return project_abbreviation, HTTPStatus.CREATED


@cors_preflight("GET, DELETE, POST")
@API.route("/types", methods=["GET", "POST", "OPTIONS"])
class ProjectTypes(Resource):
    """Endpoint resource to manage projects."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all project types."""
        project_types = ProjectService.find_all_project_types()
        return (
            jsonify(project_types),
            HTTPStatus.OK,
        )
