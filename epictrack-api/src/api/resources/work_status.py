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

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.models.dashboard_search_options import StatusDashboardSearchOptions
from api.models.pagination_options import PaginationOptions
from api.schemas import request as req
from api.schemas import response as res
from api.services import WorkStatusService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

# work/<int:work_id>/statuses
WORK_STATUS_API = Namespace("work-statuses", description="Work Statuses")
# work-statuses/dashboard
STATUS_DASHBOARD_API = Namespace("work-statuses-dashboard", description="Work Status Dashboard")


@cors_preflight("GET, POST")
@WORK_STATUS_API.route("", methods=["GET", "POST", "OPTIONS"])
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
        request_dict = req.WorkStatusParameterSchema().load(WORK_STATUS_API.payload)
        work_status = WorkStatusService.create_work_status(work_id, request_dict)
        return res.WorkStatusResponseSchema().dump(work_status), HTTPStatus.CREATED


@cors_preflight("GET")
@STATUS_DASHBOARD_API.route("/dashboard", methods=["GET", "OPTIONS"])
class StatusDashboard(Resource):
    """Endpoint resource to manage works status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def get():
        """Return most recent status for works."""
        args = request.args

        pagination_options = PaginationOptions(
            page=args.get('page', None, int),
            size=args.get('size', None, int),
            sort_key=args.get('sort_key', 'posted_date', str),
            sort_order=args.get('sort_order', 'asc', str),
        )
        search_options = StatusDashboardSearchOptions(
            is_approved=args.getlist('is_approved[]'),
            project_status=args.getlist('project_is_active[]'),
            regions=list(map(int, args.getlist('regions[]'))),
            staff_id=args.get('staff_id', None, int),
            staleness=args.getlist('staleness[]'),
            teams=list(map(int, args.getlist('teams[]'))),
            text=args.get('text', None, str),
            work_status=args.getlist('work_is_active[]'),
            work_types=list(map(int, args.getlist('work_types[]'))),
        )
        statuses = WorkStatusService.fetch_status_for_all_works(pagination_options, search_options)
        return jsonify(statuses), HTTPStatus.OK


@cors_preflight("GET, PUT")
@WORK_STATUS_API.route("/<int:status_id>", methods=["GET", "PUT", "OPTIONS"])
class Status(Resource):
    """Endpoint resource to manage a work status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(work_id, status_id):
        """Update work status"""
        request_dict = req.WorkStatusParameterSchema().load(WORK_STATUS_API.payload)

        updated_work_status = WorkStatusService.update_work_status(work_id, status_id, request_dict)

        return res.WorkStatusResponseSchema().dump(updated_work_status), HTTPStatus.OK


@cors_preflight("PATCH")
@WORK_STATUS_API.route("/<int:status_id>/approve", methods=["PATCH", "OPTIONS"])
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
