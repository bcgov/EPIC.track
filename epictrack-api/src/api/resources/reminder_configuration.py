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
"""Resource for reminder configuration endpoints."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.services import ReminderConfigurationService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("reminder-configurations", description="Reminder configurations")


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateReminderConfiguration(Resource):
    """Endpoint resource to check for existing work."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Check for existing works."""
        args = req.ReminderConfigurationExistenceQueryParamSchema().load(request.args)
        reminder_type = args["reminder_type"]
        position_id = args["position_id"]
        reminder_configuration_id = args["reminder_configuration_id"]
        exists = ReminderConfigurationService.check_existence(
            reminder_type=reminder_type,
            position_id=position_id,
            reminder_configuration_id=reminder_configuration_id,
        )
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )
