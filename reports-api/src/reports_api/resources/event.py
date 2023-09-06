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


API = Namespace("milestones", description="Milestones")


@cors_preflight("GET, POST")
@API.route("/events/works/<int:work_id>/phases/<int:phase_id>", methods=["GET", "POST", "OPTIONS"])
class Events(Resource):
    """Endpoint resource to return all milestone events"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(work_id, phase_id):
        """Return all task templates."""
        task_events = EventService.find_milestone_events_by_work_phase(
            work_id, phase_id
        )
        return (
            jsonify(res.EventResponseSchema(many=True).dump(task_events)),
            HTTPStatus.OK,
        )
    

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_id, phase_id):
        """Create a milestone event"""
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
        event_response = EventService.create_event(request_json, work_id, phase_id)
        return res.EventResponseSchema().dump(event_response), HTTPStatus.CREATED

@cors_preflight("GET, PUT")
@API.route("/events/<int:event_id>", methods=["GET", "PUT", "OPTIONS"])
class Event(Resource):
    """Endpoint resource to manage individual event"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(event_id):
        """Endpoint to update a milestone event"""
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
        event_response = EventService.update_event(request_json, event_id)
        return res.EventResponseSchema().dump(event_response), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(event_id):
        """Endpoint to update a milestone event"""
        req.MilestoneEventPathParameterSchema().load(request.view_args)
        milestone_event = EventService.find_milestone_event(event_id)
        return res.EventResponseSchema().dump(milestone_event), HTTPStatus.OK


