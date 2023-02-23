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

from flask_restx import Namespace, Resource, cors, reqparse

from reports_api.services import ReminderConfigurationService
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight


API = Namespace("reminder-configurations", description="Reminder configurations")

parser = reqparse.RequestParser(bundle_errors=True)
parser.add_argument(
    "reminder_type",
    type=str,
    required=True,
    help="Reminder type to be checked.",
    location="args",
    trim=True
)
parser.add_argument(
    "position_id",
    type=int,
    required=True,
    help="Postion id to be checked.",
    location="args",
)
parser.add_argument(
    "id", type=int, help="ID of the work in case of updates.", location="args"
)


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateReminderConfiguration(Resource):
    """Endpoint resource to check for existing work."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @API.expect(parser)
    @profiletime
    def get():
        """Check for existing works."""
        args = parser.parse_args()
        reminder_type = args["reminder_type"]
        position_id = args["position_id"]
        instance_id = args["id"]
        return (
            ReminderConfigurationService.check_existence(
                reminder_type=reminder_type, position_id=position_id, instance_id=instance_id
            ),
            HTTPStatus.OK,
        )
