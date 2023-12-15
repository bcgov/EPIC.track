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
"""Resource for Special field endpoints."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.exceptions import ResourceNotFoundError
from api.schemas import request as req
from api.schemas import response as res
from api.services.special_field import SpecialFieldService
from api.utils import auth
from api.utils.profiler import profiletime
from api.utils.util import cors_preflight


API = Namespace("special-fields", description="Special fields")


@cors_preflight("GET, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class SpecialFields(Resource):
    """Endpoint resource to return spcial fields values."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all special field values based on params."""
        params = req.SpecialFieldQueryParamSchema().load(request.args)
        values = SpecialFieldService.find_all_by_params(params)
        return jsonify(res.SpecialFieldResponseSchema(many=True).dump(values)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new task template"""
        request_json = req.SpecialFieldBodyParameterSchema().load(API.payload)
        entry = SpecialFieldService.create_special_field_entry(request_json)
        return res.SpecialFieldResponseSchema().dump(entry), HTTPStatus.CREATED


@cors_preflight('GET, PUT')
@API.route('/<int:special_field_id>', methods=['GET', 'PUT', 'OPTIONS'])
class SpecialField(Resource):
    """Endpoint resource to return special field details."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get(special_field_id):
        """Return a special field detail based on id."""
        req.SpecialFieldIdPathParameterSchema().load(request.view_args)
        special_field_entry = SpecialFieldService.find_by_id(special_field_id)
        if special_field_entry:
            return res.SpecialFieldResponseSchema().dump(special_field_entry), HTTPStatus.OK
        raise ResourceNotFoundError(f'Special field entry with id "{special_field_id}" not found')

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def put(special_field_id):
        """Update and return a special field entry."""
        req.SpecialFieldIdPathParameterSchema().load(request.view_args)
        request_json = req.SpecialFieldBodyParameterSchema().load(API.payload)
        special_field_entry = SpecialFieldService.update_special_field_entry(special_field_id, request_json)
        return res.SpecialFieldResponseSchema().dump(special_field_entry), HTTPStatus.OK
