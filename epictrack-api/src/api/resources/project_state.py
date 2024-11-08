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
"""Resource for Project State endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

import api.schemas.response as res
from api.services.project_state import ProjectStateService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace("project-states", description="EAActs")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class ProjectStates(Resource):
    """Endpoint resource to return Project States"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all Project States."""
        components = request.args.get("components")
        if components:
            components = [comp.upper().strip() for comp in components.split(",")]
            project_states = ProjectStateService.find_by_component(components)
        else:
            project_states = ProjectStateService.find_all()
        return (
            jsonify(res.ProjectStateResponseSchema(many=True).dump(project_states)),
            HTTPStatus.OK,
        )
