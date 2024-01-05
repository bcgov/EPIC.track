# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Resources for Phase endpoints"""

from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from api.schemas import response as res
from api.services.phaseservice import PhaseService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace('phases', description='Phases')


@cors_preflight('GET')
@API.route('/ea_acts/<int:ea_act_id>/work_types/<int:work_type_id>', methods=['GET', 'OPTIONS'])
class PhasesByEaActWorkType(Resource):
    """Endpoint resource to manage phases"""

    @staticmethod
    @cors.crossdomain('*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get(ea_act_id, work_type_id):
        """Return all phase codes based on ea_act_id and work_type_id."""
        phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(ea_act_id, work_type_id)
        return jsonify(res.PhaseResponseSchema(many=True).dump(phases)), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/')
class Phases(Resource):
    """Endpoint resource to manage phases"""

    @staticmethod
    @cors.crossdomain('*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get():
        """Returns all the phase codes regardless of act or work type"""
        phases = PhaseService.find_all_phases()
        return jsonify(res.PhaseResponseSchema(many=True).dump(phases)), HTTPStatus.OK
