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
"""Resource for Work Resource endpoints."""
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas import response as res
from api.schemas import request as req
from api.services.work_resource import WorkResourceService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace('work-resources', description='Work Resources')


@cors_preflight('GET, POST')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class WorkResources(Resource):
    """Endpoints for the Work Resources"""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get():
        """Return all resources for a work."""
        args = req.WorkResourceRequestSchema().load(request.args)
        work_id = args.get('work_id')
        if not work_id:
            return {'message': 'work_id query parameter is required'}, HTTPStatus.BAD_REQUEST
        resources = WorkResourceService.get_resources_by_work_id(work_id)
        return jsonify(res.CustomWorkResourceResponseSchema(many=True).dump(resources)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def post():
        """Create a new resource for a work."""
        request_dict = req.WorkResourceBodySchema().load(API.payload)
        resource = WorkResourceService.create_resource(request_dict)
        return jsonify(res.CustomWorkResourceResponseSchema().dump(resource)), HTTPStatus.CREATED


@cors_preflight('DELETE, PUT')
@API.route("/<work_resource_id>", methods=['DELETE', 'PUT', 'OPTIONS'])
class WorkResource(Resource):
    """Endpoints for a single Work Resource by ID."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(work_resource_id):
        """Update and return a work resource."""
        req.WorkResourceIdPathSchema().load(request.view_args)
        request_json = req.WorkResourceUpdateBodySchema().load(API.payload)
        work_resource = WorkResourceService.update_resource(work_resource_id, request_json)
        return res.CustomWorkResourceResponseSchema().dump(work_resource), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def delete(work_resource_id):
        """Delete a resource by its ID."""
        req.WorkResourceIdPathSchema().load(request.view_args)
        WorkResourceService.delete_resource(work_resource_id)
        return 'Work Resource successfully deleted', HTTPStatus.NO_CONTENT
