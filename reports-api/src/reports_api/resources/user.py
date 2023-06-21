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
from flask import jsonify, request
from flask_restx import Resource, Namespace, cors
from reports_api.utils import auth, constants, profiletime
from reports_api.utils.util import cors_preflight
from reports_api.services import UserService
from reports_api.schemas import response as res, request as req


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
        user_schema = res.UserResponseSchema(many=True)
        return jsonify(user_schema.dump(UserService.get_all_users())), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/groups", methods=["GET", "PUT", "OPTIONS"])    
class Groups(Resource):
    """Group resource"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Get all groups"""
        reponse_schema = res.UserGroupResponseSchema(many=True)
        return jsonify(reponse_schema.dump(UserService.get_groups())), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<user_id>/groups", methods=["PUT", "OPTIONS"]) 
class UserGroups(Resource):
    """UserGroup resource"""

    def put(user_id):
        """Update the group of the user"""
        req.UserGroupPathParamSchema().load(request.view_args)
        user_group_request = req.UserGroupBodyParamSchema().load(API.payload)
        response = UserService.update_user_group(user_id, user_group_request)
        return response
