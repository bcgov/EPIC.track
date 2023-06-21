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
"""Resource for Task endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.schemas import request as req
from reports_api.schemas import response as res
from reports_api.services import TaskService
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.caching import AppCache
from reports_api.utils.util import cors_preflight


API = Namespace("tasks", description="Tasks")


@cors_preflight("GET,POST")
@API.route("/templates", methods=["GET", "POST", "OPTIONS"])
class TaskTemplates(Resource):
    """Endpoint resource to return all task templates"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all task templates."""
        task_templates = TaskService.find_all_task_templates()
        return (
            jsonify(res.TaskTemplateResponseSchema(many=True).dump(task_templates)),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new task template"""
        request_json = req.TaskTemplateBodyParameterSchema().load(request.form)
        template_file = request.files["template_file"]
        task_template = TaskService.create_task_template(request_json, template_file)
        return res.TaskTemplateResponseSchema().dump(task_template), HTTPStatus.CREATED
