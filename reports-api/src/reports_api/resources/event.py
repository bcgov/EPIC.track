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


@cors_preflight("GET")
@API.route("/<int:work_id>/milestones", methods=["GET", "OPTIONS"])
class Templates(Resource):
    """Endpoint resource to return all milestone events for given work id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get(work_id):
        """Return all task templates."""
        req.WorkIdPathParameterSchema().load(request.view_args)
        task_events = EventService.find_milestone_events_by_work_id(work_id)
        return (
            jsonify(res.EventResponseSchema(many=True).dump(task_events)),
            HTTPStatus.OK,
        )
