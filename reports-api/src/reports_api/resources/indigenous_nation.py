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
"""Resource for indigenous nation endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors, reqparse

from reports_api.services import IndigenousNationService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace('indigenous_nations', description='Indigenous Nations')

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument('name', type=str, required=True,
                    help='Name of indigenous nation to be checked.', location='args', trim=True)
parser.add_argument('id', type=int, help='ID of the indigenous nation in case of updates.', location='args')


@cors_preflight('GET')
@API.route('/exists', methods=['GET', 'OPTIONS'])
class ValidateIndigenousNation(Resource):
    """Endpoint resource to check for existing indigenous nation."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Check for existing indigenous nations."""
        args = parser.parse_args()
        name = args['name']
        instance_id = args['id']
        return IndigenousNationService.check_existence(name=name, instance_id=instance_id), HTTPStatus.OK
