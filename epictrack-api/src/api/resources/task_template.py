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
"""Resource for Task Template endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services import TaskTemplateService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace("task-templates", description="Task Templates")


@cors_preflight("GET,POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Templates(Resource):
    """Endpoint resource to return all task templates"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all task templates."""
        args = req.TaskTemplateQueryParamSchema().load(request.args)
        task_templates = TaskTemplateService.find_all_task_templates(args)
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
        task_template = TaskTemplateService.create_task_template(request_json, template_file)
        return res.TaskTemplateResponseSchema().dump(task_template), HTTPStatus.CREATED


@cors_preflight("GET")
@API.route("/<int:template_id>/tasks", methods=["GET", "OPTIONS"])
class TemplateTasks(Resource):
    """Endpoint resource to manage tasks for a template"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get(template_id):
        """Return all tasks for the template."""
        req.TaskTemplateIdPathParameterSchema().load(request.view_args)
        tasks = TaskTemplateService.find_tasks_by_template_id(template_id)
        return (
            jsonify(res.TaskResponseSchema(many=True).dump(tasks)),
            HTTPStatus.OK,
        )


@cors_preflight("GET,PATCH,DELETE")
@API.route("/<int:template_id>", methods=["GET", "PATCH", "DELETE", "OPTIONS"])
class Template(Resource):
    """Endpoint resource to manage a task template."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(template_id):
        """Get a task template details"""
        req.TaskTemplateIdPathParameterSchema().load(request.view_args)
        template = TaskTemplateService.find_by_id(template_id=template_id, exclude_deleted=True)
        return res.TaskTemplateResponseSchema().dump(template), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def patch(template_id):
        """Patch a task template instance"""
        req.TaskTemplateIdPathParameterSchema().load(request.view_args)
        request_json = req.TaskTemplateBodyParameterSchema().load(
            API.payload, partial=True
        )
        template = TaskTemplateService.update_template(
            template_id=template_id, payload=request_json
        )
        return res.TaskTemplateResponseSchema().dump(template), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(template_id):
        """Delete a task template"""
        req.TaskTemplateIdPathParameterSchema().load(request.view_args)
        TaskTemplateService.delete_template(template_id)
        return "Task template successfully deleted", HTTPStatus.OK
