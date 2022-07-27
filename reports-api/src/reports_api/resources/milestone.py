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
"""Resource for milestone endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors

from reports_api.services import MilestoneService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight
from reports_api.utils.caching import AppCache
from reports_api.utils import constants


API = Namespace('milestones', description='MileStones')


@cors_preflight('GET')
@API.route('/phases/<int:phase_id>', methods=['GET', 'OPTIONS'])
class Milestones(Resource):
    """Endpoint resource to return milestones which are neither start event nor end event."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get(phase_id):
        """Return all milestones based on phase_id."""
        return MilestoneService.find_non_decision_by_phase_id(phase_id), HTTPStatus.OK


@cors_preflight('GET')
@API.route('/<int:milestone_id>', methods=['GET', 'OPTIONS'])
class Milestone(Resource):
    """Endpoint resource to return milestone by id"""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT)
    @profiletime
    def get(milestone_id):
        """Return single milestone based on the milestone id given"""
        return MilestoneService.find_milestone_by_id(milestone_id), HTTPStatus.OK
