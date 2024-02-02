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
"""Resource for proponent endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services import ProponentService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("proponents", description="Proponent")


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateProponent(Resource):
    """Endpoint resource to check for existing proponent."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Check for existing proponent."""
        args = req.ProponentExistenceQueryParamSchema().load(request.args)
        name = args["name"]
        proponent_id = args["proponent_id"]
        exists = ProponentService.check_existence(name=name, proponent_id=proponent_id)
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:proponent_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class Proponent(Resource):
    """Endpoint resource to manage a proponent."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(proponent_id):
        """Return details of a proponent."""
        req.ProponentIdPathParameterSchema().load(request.view_args)
        proponent = ProponentService.find_by_id(proponent_id, exclude_deleted=True)
        return res.ProponentResponseSchema().dump(proponent), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(proponent_id):
        """Update and return a proponent."""
        req.ProponentIdPathParameterSchema().load(request.view_args)
        request_json = req.ProponentBodyParameterSchema().load(API.payload)
        proponent = ProponentService.update_proponent(proponent_id, request_json)
        return res.ProponentResponseSchema().dump(proponent), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(proponent_id):
        """Delete a proponent"""
        req.ProponentIdPathParameterSchema().load(request.view_args)
        ProponentService.delete_proponent(proponent_id)
        return "Proponent successfully deleted", HTTPStatus.OK


@cors_preflight("GET,POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class Proponents(Resource):
    """Endpoint resource to return proponents."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all proponents."""
        proponents = ProponentService.find_all_proponents()
        return jsonify(res.ProponentResponseSchema(many=True).dump(proponents)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new proponent"""
        request_json = req.ProponentBodyParameterSchema().load(API.payload)
        proponent = ProponentService.create_proponent(request_json)
        return res.ProponentResponseSchema().dump(proponent), HTTPStatus.CREATED


@cors_preflight("POST")
@API.route("/import", methods=["POST", "OPTIONS"])
class ImportProponents(Resource):
    """Endpoint resource to import proponents."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Import proponents"""
        file = request.files["file"]
        response = ProponentService.import_proponents(file)
        return response, HTTPStatus.CREATED
