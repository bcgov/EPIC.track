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
"""Resource for code endpoints."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, cors

from api.services.code import CodeService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace('codes', description='Codes')


@cors_preflight('GET')
@API.route('/<string:code_type>', methods=['GET', 'OPTIONS'])
class Codes(Resource):
    """Endpoint resource to return codes."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get(code_type):
        """Return all codes based on code_type."""
        filters = dict(request.args)
        return CodeService.find_code_values_by_type(code_type, filters), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/<string:code_type>/<string:code>', methods=['GET', 'OPTIONS'])
class Code(Resource):
    """Endpoint resource to return codes."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    def get(code_type, code):
        """Return all codes based on code_type."""
        return CodeService.find_code_value_by_type_and_code(code_type, code), HTTPStatus.OK
