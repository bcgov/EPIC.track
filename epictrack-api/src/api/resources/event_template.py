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
"""Resource for Event Template endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.services import EventTemplateService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("tasks", description="Tasks")


@cors_preflight("POST")
@API.route("", methods=["POST", "OPTIONS"])
class EventTemplates(Resource):
    """Endpoints for EventTemplates"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new task template"""
        template_file = request.files["event_template"]
        event_template = EventTemplateService.import_events_template(template_file)
        return jsonify(event_template), HTTPStatus.CREATED
