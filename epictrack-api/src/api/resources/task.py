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

from api.schemas import request as req
from api.schemas import response as res
from api.services import TaskService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("tasks", description="Tasks")


@cors_preflight("GET,POST,PATCH,DELETE")
@API.route("/events", methods=["GET", "DELETE", "POST", "PATCH", "OPTIONS"])
class Events(Resource):
    """Endpoint resource to return all task events for given work id and phase id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all task templates."""
        args = req.TaskEventQueryParamSchema().load(request.args)
        work_phase_id = args.get("work_phase_id")
        task_events = TaskService.find_task_events(work_phase_id)
        return (
            jsonify(res.TaskEventResponseSchema(many=True).dump(task_events)),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create a new Task Event"""
        request_json = req.TaskEventBodyParamSchema().load(API.payload)
        task_response = TaskService.create_task_event(request_json)
        return res.TaskEventResponseSchema().dump(task_response), HTTPStatus.CREATED

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def patch():
        """Bulk update tasks."""
        request_json = req.TaskEventBulkUpdateBodyParamSchema(partial=True).load(
            API.payload
        )
        result = TaskService.bulk_update(request_json)
        return result, HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete():
        """Delete tasks."""
        request_json = req.TasksBulkDeleteQueryParamSchema().load(request.args)
        task_ids = request_json.get("task_ids")
        work_id = request_json.get("work_id")
        result = TaskService.bulk_delete_tasks(task_ids, work_id)
        return result, HTTPStatus.OK


@cors_preflight("POST")
@API.route("/events/copy", methods=["GET", "DELETE", "POST", "PATCH", "OPTIONS"])
class CopyEvents(Resource):
    """Endpoints for copying task events from one work to another"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Copy events from one work to another"""
        request_json = req.CopyTaskEventBodyParameterSchema().load(API.payload)
        result = TaskService.copy_task_events(request_json, commit=True)
        return (
            jsonify(res.TaskEventResponseSchema(many=True).dump(result)),
            HTTPStatus.CREATED,
        )


@cors_preflight("GET,PUT")
@API.route("/events/<int:event_id>", methods=["GET", "PUT", "OPTIONS"])
class Event(Resource):
    """Endpoint resource to handle single TaskEvent"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(event_id):
        """Create a new Task Event"""
        request_json = req.TaskEventBodyParamSchema().load(API.payload)
        task_response = TaskService.update_task_event(request_json, event_id)
        return res.TaskEventResponseSchema().dump(task_response), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(event_id):
        """Gets the task event"""
        req.TaskEventIdPathParameterSchema().load(request.view_args)
        task_event = TaskService.find_task_event(event_id, exclude_deleted=True)
        return res.TaskEventResponseSchema().dump(task_event), HTTPStatus.OK


@cors_preflight("GET,POST")
@API.route("/work_phase/<int:work_phase_id>/sheet", methods=["GET", "POST", "OPTIONS"])
class Templates(Resource):
    """Endpoint resource to return all task templates"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_phase_id):
        """Create new task template"""
        template_file = request.files["template_file"]
        task_template = TaskService.create_task_events_from_sheet(work_phase_id, template_file)
        return res.TaskTemplateResponseSchema().dump(task_template), HTTPStatus.CREATED


@cors_preflight("POST")
@API.route("/templates/<int:template_id>/events", methods=["POST", "OPTIONS"])
class TemplateEvents(Resource):
    """Endpoint resource to return all task events for given work id and phase id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(template_id: int):
        """Return all task templates."""
        request_json = req.TaskTemplateImportEventsBodyParamSchema().load(API.payload)
        task_events = TaskService.create_task_events_from_template(
            request_json, template_id
        )
        return (
            jsonify(res.TaskEventResponseSchema(many=True).dump(task_events)),
            HTTPStatus.CREATED,
        )


@cors_preflight("GET")
@API.route("/events/staff-work/<int:staff_id>", methods=["GET", "OPTIONS"])
class AssigneeEvents(Resource):
    """Endpoint resource to return all task events for given assignee id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(staff_id: int):
        """Return all task templates."""
        args = req.TaskEventByStaffQueryParamSchema().load(request.args)
        task_events = TaskService.find_by_staff_work_role_staff_id(
            staff_id, is_active=args.get("is_active", None))
        return (
            jsonify(res.TaskEventByStaffResponseSchema(many=True).dump(task_events)),
            HTTPStatus.OK,
        )
