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

from api.schemas import request as req
from api.schemas import response as res
from api.services.event import EventService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight
from api.utils.datetime_helper import get_start_of_day

API = Namespace("milestones", description="Milestones")


@cors_preflight("GET, POST")
@API.route("/workphases/<int:work_phase_id>/events", methods=["GET", "POST", "OPTIONS"])
class Events(Resource):
    """Endpoint resource to return all milestone events"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(work_phase_id):
        """Return all task templates."""
        milestone_events = EventService.find_milestone_events_by_work_phase(
            work_phase_id
        )
        return (
            jsonify(res.EventResponseSchema(many=True).dump(milestone_events)),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(work_phase_id):
        """Create a milestone event"""
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
        args = req.MilestoneEventPushEventQueryParameterSchema().load(request.args)
        request_json["anticipated_date"] = get_start_of_day(request_json.get("anticipated_date"))
        request_json["actual_date"] = get_start_of_day(request_json.get("actual_date"))
        event_response = EventService.create_event(request_json, work_phase_id, args.get("push_events"))
        return res.EventResponseSchema().dump(event_response), HTTPStatus.CREATED


@cors_preflight("GET, PUT, DELETE")
@API.route("/events/<int:event_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Event(Resource):
    """Endpoint resource to manage individual event"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(event_id):
        """Endpoint to update a milestone event"""
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
        args = req.MilestoneEventPushEventQueryParameterSchema().load(request.args)
        request_json["anticipated_date"] = get_start_of_day(request_json.get("anticipated_date"))
        request_json["actual_date"] = get_start_of_day(request_json.get("actual_date"))
        event_response = EventService.update_event(request_json, event_id, args.get("push_events"))
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

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(event_id):
        """Endpoint to delete a milestone event"""
        req.MilestoneEventPathParameterSchema().load(request.view_args)
        message = EventService.delete_event(event_id)
        return message, HTTPStatus.OK


@cors_preflight("DELETE")
@API.route("/events", methods=["DELETE", "OPTIONS"])
class MilestoneEvents(Resource):
    """Endpoint resource to manage milestone events"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete():
        """Delete milestone events."""
        request_json = req.MilestoneEventBulkDeleteQueryParamSchema().load(request.args)
        result = EventService.bulk_delete_milestones(request_json["milestone_ids"])
        return result, HTTPStatus.OK


@cors_preflight("GET")
@API.route("/check-events", methods=["POST", "OPTIONS"])
class ValidateWork(Resource):
    """Endpoint resource to check the given event go past the phase end date"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Check for existing works."""
        args = req.MilestoneEventCheckQueryParameterSchema().load(request.args)
        request_json = req.MilestoneEventBodyParameterSchema().load(API.payload)
        request_json["anticipated_date"] = get_start_of_day(request_json.get("anticipated_date"))
        request_json["actual_date"] = get_start_of_day(request_json.get("actual_date"))
        event_id = args.get("event_id")
        result = EventService.check_event(request_json, event_id)
        return res.EventDateChangePosibilityCheckResponseSchema().dump(result), HTTPStatus.OK
