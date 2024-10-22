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
"""Resource for Act Section endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.services import ActSectionService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight

from api.schemas import request as req
from api.schemas import response as res

API = Namespace("act-sections", description="ActSections")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class ActSections(Resource):
    """Endpoint resource to return sub types based on type id"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all sub_types based on type_id."""
        args = req.ActSectionQueryParameterSchema().load(request.args)
        act_sections = ActSectionService.find_by_ea_act(args)
        return jsonify(res.ActSectionResponseSchema(many=True).dump(act_sections)), HTTPStatus.OK
