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
"""Resource for Event endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.schemas import request as req
from reports_api.schemas import response as res
from reports_api.services.event import EventService
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.caching import AppCache
from reports_api.utils.util import cors_preflight


API = Namespace("events", description="Events")


@cors_preflight("GET, POST")
@API.route("/milestones", methods=["GET", "POST", "OPTIONS"])
class Events(Resource):
    """Endpoint resource to return all milestone events for given work id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all task templates."""
        args = req.MilestoneEventQueryParamSchema().load(request.args)
        work_id = args.get("work_id")
        phase_id = args.get("phase_id")
        task_events = EventService.find_milestone_events_by_work_phase(
            work_id, phase_id
        )
        return (
            jsonify(res.EventResponseSchema(many=True).dump(task_events)),
            HTTPStatus.OK,
        )
    
    def post():
        """Create a milestone event"""
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
