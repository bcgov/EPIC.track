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
"""Resource for work endpoints."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, cors

from reports_api.services import WorkService
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.caching import AppCache
from reports_api.utils.util import cors_preflight


API = Namespace('works', description='Works')


@cors_preflight('GET')
@API.route('/exists/', methods=['GET', 'OPTIONS'])
class ValidateWork(Resource):
    """Endpoint resource to return staffs."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    @profiletime
    def get():
        """Return all active staffs."""
        project_id = request.args.get('project_id', None)
        work_type_id = request.args.get('work_type_id', None)
        return WorkService.check_existence(project_id, work_type_id), HTTPStatus.OK
