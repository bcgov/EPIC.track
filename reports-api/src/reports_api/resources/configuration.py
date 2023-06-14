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
"""Resource for configurations"""

from http import HTTPStatus
from flask_restx import Namespace, Resource, cors
from flask import jsonify, request
import pandas as pd
from reports_api.utils import auth, profiletime
from reports_api.utils.util import cors_preflight
from reports_api.services.configuration import ConfigurationService
from reports_api.exceptions import BusinessError, BadRequestError

API = Namespace("configurations", description="Application Configurations")


@cors_preflight("POST")
@API.route("/events", methods=["POST", "OPTIONS"])
class EventConfigurationsImport(Resource):
    """Endpoints for import event configurations"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Import event configurations"""
        event_configurations = request.files['event_configurations']
        try:

            ConfigurationService.import_events_configurations(event_configurations)
        except BadRequestError as err:
            return err.message, HTTPStatus.BAD_REQUEST
        except Exception as err:
            return str(err), HTTPStatus.INTERNAL_SERVER_ERROR
        response = jsonify({'message' : 'File imported successfully'})
        return response, HTTPStatus.CREATED
