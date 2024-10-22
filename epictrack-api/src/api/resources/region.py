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
"""Resource for Sub Sector endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas.region import RegionSchema
from api.services.region import RegionService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace("regions", description="Regions")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class Regions(Resource):
    """Endpoint resource to return regions based on region type."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all regions based on region type."""
        req.RegionTypePathParameterSchema().load(request.args)
        region_type = request.args.get("type", None)
        regions = RegionService.find_regions_by_type(region_type)
        return jsonify(RegionSchema(many=True).dump(regions)), HTTPStatus.OK
