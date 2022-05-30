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
"""Resource for inspection endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors

from reports_api.services import InspectionService
from reports_api.utils.util import cors_preflight


API = Namespace('inspections', description='Inspections')


@cors_preflight('GET')
@API.route('/count', methods=['GET', 'OPTIONS'])
class Inspections(Resource):
    """Endpoint resource to return number of inspections."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Return total number of inspections."""
        return InspectionService.get_count(), HTTPStatus.OK
