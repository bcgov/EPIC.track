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
"""Resource for work issues endpoints."""
from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services import WorkIssuesService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace("work-issues", description="Work Issues")


@cors_preflight("GET, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class WorkStatus(Resource):
    """Endpoint resource to manage work issues."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    def get(work_id):
        """Return all active works."""
        try:
            works = WorkIssuesService.find_all_work_issues(work_id)
            return jsonify(res.WorkIssuesResponseSchema(many=True).dump(works)), HTTPStatus.OK
        except Exception as e:
            return jsonify({'error': str(e)}), HTTPStatus.BAD_REQUEST

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_id):
        """Create new work status"""
        request_dict = req.WorkIssuesParameterSchema().load(API.payload)
        work_issues = WorkIssuesService.create_work_issue_and_updates(work_id, request_dict)
        return res.WorkIssuesResponseSchema().dump(work_issues), HTTPStatus.CREATED


@cors_preflight("PUT")
@API.route("/<int:issue_id>", methods=["PUT", "OPTIONS"])
class IssueUpdateEdits(Resource):
    """Endpoint resource to manage updates/edits for a specific issue and its description."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(work_id, issue_id):
        """Create a new update for the specified issue."""
        request_dict = req.WorkIssuesUpdateSchema().load(API.payload)
        work_issues = WorkIssuesService.edit_issue_update(work_id, issue_id, request_dict)
        return res.WorkIssuesResponseSchema().dump(work_issues), HTTPStatus.CREATED


@cors_preflight("POST")
@API.route("/<int:issue_id>/issue_update", methods=["POST", "OPTIONS"])
class WorkIssueUpdate(Resource):
    """Endpoint resource to manage updates for a specific issue."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_id, issue_id):
        """Create a new update for the specified issue."""
        description_data = API.payload.get('description_data', None)
        if not description_data:
            return jsonify({'error': 'description_data is required'}), HTTPStatus.BAD_REQUEST
        work_issues = WorkIssuesService.add_work_issue_update(work_id, issue_id, description_data)
        return res.WorkIssuesResponseSchema().dump(work_issues), HTTPStatus.CREATED


@cors_preflight("PATCH")
@API.route("/<int:issue_id>/update/<int:update_id>/approve", methods=["PATCH", "OPTIONS"])
class ApproveIssues(Resource):
    """Endpoint resource to manage approving of work status."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    # pylint: disable=unused-argument
    def patch(work_id, issue_id, update_id):
        """Approve a work status."""
        approved_work_issues = WorkIssuesService.approve_work_issues(issue_id, update_id)

        return res.WorkIssueUpdatesResponseSchema().dump(approved_work_issues), HTTPStatus.OK
