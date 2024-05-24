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
"""Resource for work status endpoints."""
from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services import WorkStatusService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace("work-statuses", description="Work Statuses")


@cors_preflight("GET, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class WorkStatus(Resource):
    """Endpoint resource to manage work status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def get(work_id):
        """Return all active works."""
        works = WorkStatusService.find_all_work_status(work_id)
        return jsonify(res.WorkStatusResponseSchema(many=True).dump(works)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_id):
        """Create new work status"""
        request_dict = req.WorkStatusParameterSchema().load(API.payload)
        work_status = WorkStatusService.create_work_status(work_id, request_dict)
        return res.WorkStatusResponseSchema().dump(work_status), HTTPStatus.CREATED


@cors_preflight("GET, PUT")
@API.route("/<int:status_id>", methods=["GET", "PUT", "OPTIONS"])
class Status(Resource):
    """Endpoint resource to manage a work status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(work_id, status_id):
        """Update work status"""
        request_dict = req.WorkStatusParameterSchema().load(API.payload)

        updated_work_status = WorkStatusService.update_work_status(work_id, status_id, request_dict)

        return res.WorkStatusResponseSchema().dump(updated_work_status), HTTPStatus.OK


@cors_preflight("PATCH")
@API.route("/<int:status_id>/approve", methods=["PATCH", "OPTIONS"])
class ApproveStatus(Resource):
    """Endpoint resource to manage approving of work status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def patch(work_id, status_id):
        """Approve a work status."""
        existing_work_status = WorkStatusService.find_work_status_by_id(work_id, status_id)
        if existing_work_status is None:
            return {"message": "Work status not found"}, HTTPStatus.NOT_FOUND

        approved_work_status = WorkStatusService.approve_work_status(existing_work_status)

        return res.WorkStatusResponseSchema().dump(approved_work_status), HTTPStatus.OK
