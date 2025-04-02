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
"""Resource for Ministry endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import response as res
from api.schemas import request as req
from api.services.ministry import MinistryService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace('ministries', description='Ministries')


@cors_preflight('GET, POST')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class Ministries(Resource):
    """Endpoints for the Ministries"""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get():
        """Return all ministries."""
        ministries = MinistryService.find_all()
        return_type = request.args.get("return_type", None)
        if return_type == "list_type":
            schema = res.ListTypeResponseSchema(many=True)
        else:
            schema = res.MinistryResponseSchema(many=True)
        return jsonify(schema.dump(ministries)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def post():
        """Preflight options for Ministries."""
        request_dict = req.MinistryBodyParameterSchema().load(API.payload)
        ministry = MinistryService.create_ministry(request_dict)
        return jsonify(res.MinistryResponseSchema().dump(ministry)), HTTPStatus.CREATED


@cors_preflight('PUT')
@API.route('/<int:ministry_id>', methods=['PUT', 'OPTIONS'])
class Ministry(Resource):
    """Endpoint resource to manage a ministry."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def put(ministry_id):
        """Preflight options for Ministries."""
        request_dict = req.MinistryUpdateParameterSchema().load(API.payload)
        ministry = MinistryService.update_ministry(ministry_id, request_dict)
        return jsonify(res.MinistryResponseSchema().dump(ministry)), HTTPStatus.OK
