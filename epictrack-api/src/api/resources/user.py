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
from flask_restx import Namespace, Resource, cors
from api.exceptions import BusinessError
from api.schemas import request as req
from api.schemas import response as res
from api.services import UserService
from api.utils import auth, profiletime
from api.utils.roles import Role
from api.utils.util import cors_preflight

API = Namespace("users", description="Users")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class Users(Resource):
    """Users resource"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.has_one_of_roles([Role.MANAGE_USERS.value])
    @profiletime
    def get():
        """Get all users"""
        user_schema = res.UserResponseSchema(many=True)
        return jsonify(user_schema.dump(UserService.get_all_users())), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/groups", methods=["GET", "OPTIONS"])
class Groups(Resource):
    """Group resource"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.has_one_of_roles([Role.MANAGE_USERS.value])
    @profiletime
    def get():
        """Get all groups"""
        reponse_schema = res.UserGroupResponseSchema(many=True)
        return jsonify(reponse_schema.dump(UserService.get_groups())), HTTPStatus.OK


@cors_preflight("PUT")
@API.route("/<uuid:user_id>/groups", methods=["PUT", "OPTIONS"])
class UserGroups(Resource):
    """UserGroup resource"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.has_one_of_roles([Role.MANAGE_USERS.value])
    @profiletime
    def put(user_id):
        """Update the group of the user"""
        req.UserGroupPathParamSchema().load(request.view_args)
        user_group_request = req.UserGroupBodyParamSchema().load(API.payload)

        response = UserService.update_user_group(user_id, user_group_request)
        if response.status_code == 204:
            return '', HTTPStatus.NO_CONTENT
        raise BusinessError('Update failed', 500)
