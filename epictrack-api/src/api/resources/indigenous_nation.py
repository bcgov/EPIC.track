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
"""Resource for indigenous nation endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import request as req
from api.schemas import response as res
from api.services import IndigenousNationService
from api.utils import auth, profiletime
from api.utils.str import natural_sort
from api.utils.util import cors_preflight


API = Namespace("indigenous_nations", description="Indigenous Nations")


@cors_preflight("GET")
@API.route("/exists", methods=["GET", "OPTIONS"])
class ValidateIndigenousNation(Resource):
    """Endpoint resource to check for existing indigenous nation."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Check for existing indigenous nations."""
        args = req.IndigenousNationExistenceQueryParamSchema().load(request.args)
        name = args["name"]
        indigenous_nation_id = args["indigenous_nation_id"]
        exists = IndigenousNationService.check_existence(
            name=name, indigenous_nation_id=indigenous_nation_id
        )
        return (
            {"exists": exists},
            HTTPStatus.OK,
        )


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:indigenous_nation_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class IndigenousNation(Resource):
    """Endpoint resource to manage an indigenous nation."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(indigenous_nation_id):
        """Return details of an indigenous nation."""
        req.IndigenousNationIdPathParameterSchema().load(request.view_args)
        indigenous_nation = IndigenousNationService.find(indigenous_nation_id, exclude_deleted=True)
        return (
            res.IndigenousResponseNationSchema().dump(indigenous_nation),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(indigenous_nation_id):
        """Update and return an indigenous nation."""
        req.IndigenousNationIdPathParameterSchema().load(request.view_args)
        request_json = req.IndigenousNationBodyParameterSchema().load(API.payload)
        indigenous_nation = IndigenousNationService.update_indigenous_nation(
            indigenous_nation_id, request_json
        )
        return (
            res.IndigenousResponseNationSchema().dump(indigenous_nation),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(indigenous_nation_id):
        """Delete an indigenous nation"""
        req.IndigenousNationIdPathParameterSchema().load(request.view_args)
        IndigenousNationService.delete_indigenous_nation(indigenous_nation_id)
        return "Indigenous nation successfully deleted", HTTPStatus.OK


@cors_preflight("GET,POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class IndigenousNations(Resource):
    """Endpoint resource to return indigenous nations."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all indigenous nations."""
        args = req.BasicRequestQueryParameterSchema().load(request.args)
        indigenous_nations = IndigenousNationService.find_all_indigenous_nations(
            args.get("is_active")
        )
        response = res.IndigenousResponseNationSchema(many=True).dump(indigenous_nations)
        response = natural_sort(response, "name")
        return (
            jsonify(response),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Create new staff"""
        request_json = req.IndigenousNationBodyParameterSchema().load(API.payload)
        indigenous_nation = IndigenousNationService.create_indigenous_nation(
            request_json
        )
        return (
            res.IndigenousResponseNationSchema().dump(indigenous_nation),
            HTTPStatus.CREATED,
        )


@cors_preflight("POST")
@API.route("/import", methods=["POST", "OPTIONS"])
class ImportIndigenousNations(Resource):
    """Endpoint resource to import indigenous nations."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post():
        """Import indigenous nations"""
        file = request.files["file"]
        response = IndigenousNationService.import_indigenous_nations(file)
        return response, HTTPStatus.CREATED
