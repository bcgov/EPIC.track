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
"""Resource for Event Configuration endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from reports_api.schemas import request as req
from reports_api.schemas import response as res
from reports_api.services.event_configuration import EventConfigurationService
from reports_api.models.event_category import PRIMARY_CATEGORIES
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("event-configurations", description="Event Configurations")


@cors_preflight("GET")
@API.route("/", methods=["GET", "OPTIONS"])
class EventConfigurations(Resource):
    """Endpoint resource to return all event configurations for given parameters"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all task templates."""
        args = req.EventConfigurationQueryParamSchema().load(request.args)
        work_id = args.get("work_id")
        phase_id = args.get("phase_id")
        mandatory = args.get("mandatory")
        configurations = EventConfigurationService.find_configurations(phase_id, work_id, mandatory, PRIMARY_CATEGORIES)
        return (
            jsonify(res.EventConfigurationResponseSchema(many=True).dump(configurations)),
            HTTPStatus.OK,
        )
