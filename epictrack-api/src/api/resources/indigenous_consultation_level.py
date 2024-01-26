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
"""Resource for consultation level endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors

from api.services import IndigenousConsultationLevelService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight


API = Namespace("indigenous-nations-consultation-levels", description="Indigenous Nations Consultation Levels")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class ConsultationLevel(Resource):
    """Endpoint resource to manage an consultation level."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all consultation levels."""
        levels = IndigenousConsultationLevelService.find_all_consultation_levels(is_active=True)
        return [{"id": level.id, "name": level.name} for level in levels], HTTPStatus.OK
