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
"""Resource for Outcome Configuration endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services.outcome_configuration import OutcomeConfigurationService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace('outcome_configurations', description='Outcome Configurations')


@cors_preflight('GET')
@API.route('/', methods=['GET', 'OPTIONS'])
class OutcomeConfigurations(Resource):
    """Endpoints for the outcome configurations"""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    @profiletime
    def get():
        """Return all outcomes based on milestone_id."""
        args = req.OutcomeConfigurationQueryParameterSchema().load(request.args)
        outcomes = OutcomeConfigurationService.find_by_configuration_id(args.get("configuration_id"))
        return jsonify(res.OutcomeConfigurationResponseSchema(many=True).dump(outcomes)), HTTPStatus.OK
