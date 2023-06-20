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
"""User resource"""
from http import HTTPStatus
from flask import jsonify
from flask_restx import Resource, Namespace, cors
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.util import cors_preflight
from reports_api.services import UserService
from reports_api.schemas import response as res


API = Namespace("users", description="Users")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class Users(Resource):
    """Users resource"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Get all users"""
        return jsonify(UserService.get_groups()), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/groups", methods=["GET", "OPTIONS"])    
class UserGroups(Resource):
    """User groups"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Get all groups"""
        reponse_schema = res.UserGroupResponseSchema(many=True)
        return jsonify(reponse_schema.dump(UserService.get_groups())), HTTPStatus.OK
        

