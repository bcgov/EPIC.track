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

from flask_restx import Namespace, Resource, cors

from reports_api.services import ProjectService
from reports_api.utils.util import cors_preflight


API = Namespace('projects', description='Projects')


@cors_preflight('GET')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class Projects(Resource):
    """Endpoint resource to manage projects."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Return all projects."""
        return ProjectService.find_all(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def post():
        """Create new project"""
        project = ProjectService.create_project(API.payload)
        return project.as_dict(), HTTPStatus.CREATED


@cors_preflight('GET')
@API.route('/<int:project_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
class Project(Resource):
    """Endpoint resource to manage a project."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(project_id):
        """Return details of a project."""
        return ProjectService.find(project_id), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def put(project_id):
        """Update and return a project."""
        project = ProjectService.update_project(project_id, API.payload)
        return project.as_dict(), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def delete(project_id):
        """Delete a project"""
        ProjectService.delete_project(project_id)
        return {"message": "Project successfully deleted"}, HTTPStatus.OK
