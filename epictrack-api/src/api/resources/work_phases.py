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

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.services.work_phase import WorkPhaseService
from api.schemas import request as req
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace('work-phases', description='Work Phases')


@cors_preflight('GET')
@API.route("", methods=['GET', 'OPTIONS'])
class WorkPhases(Resource):
    """Endpoint resource to manage phases"""

    @staticmethod
    @cors.crossdomain('*')
    @auth.require
    @profiletime
    def get():
        """Return all work phases."""
        request_args = req.WorkPhaseQueryParameterSchema().load(request.args)
        data = WorkPhaseService.find_all_work_phases_with_additional_info(legislated=request_args.get("legislated"))
        return jsonify(data), HTTPStatus.OK
