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
"""Resource for syncing work form data with reports DB."""
from http import HTTPStatus
import pydoc

from flask_restx import Namespace, Resource, cors

from reports_api.services.sync_form_data import SyncFormDataService
from reports_api.utils import auth, profiletime
from reports_api.utils.constants import SCHEMA_MAPS
from reports_api.utils.util import cors_preflight


API = Namespace('sync-form-data', description='Sync Form Data')


@cors_preflight('GET')
@API.route('', methods=['POST', 'OPTIONS'])
class SyncFormData(Resource):
    """Endpoint resource to manage a project."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def post():
        """Update and return a project."""
        schema_name = API.payload.get('validatorKey', '_')
        schema_path = SCHEMA_MAPS.get(schema_name, None)

        if schema_path is None:
            return {"message": "No matching validator found"}, HTTPStatus.INTERNAL_SERVER_ERROR
        schema_class = pydoc.locate(schema_path)
        schema_errors = schema_class.from_dict(API.payload).validate()
        if isinstance(schema_errors, dict):
            return schema_errors, HTTPStatus.BAD_REQUEST

        response = SyncFormDataService.sync_data(API.payload)
        return response, HTTPStatus.OK
