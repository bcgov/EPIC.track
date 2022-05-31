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

from flask_restx import Namespace, Resource, cors

from reports_api.services.phaseservice import PhaseService
from reports_api.utils.util import cors_preflight


API = Namespace('phases', description='Phases')


@cors_preflight('GET')
@API.route('/ea_acts/<int:ea_act_id>/work_types/<int:work_type_id>', methods=['GET', 'OPTIONS'])
class PhasesByEaActWorkType(Resource):
    """Endpoint resource to manage phases"""

    @staticmethod
    @cors.crossdomain('*')
    def get(ea_act_id, work_type_id):
        """Return all phase codes based on ea_act_id and work_type_id."""
        return PhaseService.find_phase_codes_by_ea_act_and_work_type(ea_act_id, work_type_id), HTTPStatus.OK
