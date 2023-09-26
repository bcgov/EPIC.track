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
"""Resource for outcome endpoints."""
from http import HTTPStatus
from flask import jsonify
from flask_restx import Namespace, Resource, cors

from reports_api.services import OutcomeService
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.caching import AppCache
from reports_api.utils.util import cors_preflight
from reports_api.schemas import response as res


API = Namespace('outcomes', description='Outcomes')


@cors_preflight('GET')
@API.route('/milestones/<int:milestone_id>', methods=['GET', 'OPTIONS'])
class Outcomes(Resource):
    """Endpoint resource to return outcomes for a milestone."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get(milestone_id):
        """Return all outcomes based on milestone_id."""
        outcomes = OutcomeService.find_by_milestone_id(milestone_id)
        outcomes_schema = res.OutcomeTemplateResponseSchema(many=True, only=("id", "name", "terminates_work"))
        return jsonify(outcomes_schema.dump(outcomes)), HTTPStatus.OK


@cors_preflight('GET')
@API.route('', methods=['GET', 'OPTIONS'])
class ActiveOutcomes(Resource):
    """Endpoint resource to return all active outcomes"""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get():
        """Return single milestone based on the milestone id given"""
        outcomes = OutcomeService.find_all_active_milestones()
        outcomes_schema = res.OutcomeTemplateResponseSchema(many=True, only=("id", "name", "milestone_id", "terminates_work"))
        return outcomes_schema.dump(outcomes), HTTPStatus.OK
