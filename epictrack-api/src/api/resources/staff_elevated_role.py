"""Resource for staff_elevated_role endpoints."""
from http import HTTPStatus

from flask import current_app, jsonify, request
from flask_restx import Namespace, Resource, cors

from api.schemas.request.staff_elevated_role_request import StaffElevatedRoleBodyParamSchema, StaffElevatedRoleIdPathParamSchema, StaffElevatedRoleQueryParamSchema
from api.schemas.response.staff_elevated_role_response import StaffElevatedRoleResponseSchema
from api.services.staff_elevated_role import StaffElevatedRoleService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace("staff-elevated-roles", description="Staff Elevated Roles")


@cors_preflight('GET, POST')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class StaffElevatedRoles(Resource):
    """Endpoint resource to return staff elevated roles."""

    @staticmethod
    @auth.require
    @cors.crossdomain(origin='*')
    @profiletime
    def get():
        """Return all active staff elevated roles."""
        args = StaffElevatedRoleQueryParamSchema().load(request.args)
        is_active = args.get('is_active')
        staff_id = args.get('staff_id')
        elevated_role_id = args.get('elevated_role_id')
        staff_elevated_role_id = args.get('staff_elevated_role_id')
        if staff_id:
            staff_elevated_roles = StaffElevatedRoleService.find_by_staff_id(staff_id, is_active)
        elif elevated_role_id:
            staff_elevated_roles = StaffElevatedRoleService.find_by_elevated_role_id(elevated_role_id, is_active)
        elif staff_elevated_role_id:
            staff_elevated_roles = StaffElevatedRoleService.find_by_id(staff_elevated_role_id, is_active)
        elif is_active is None or is_active:
            current_app.logger.debug('Find all active staff elevated roles')
            staff_elevated_roles = StaffElevatedRoleService.find_all_active()
        else:
            current_app.logger.debug('Find all staff elevated roles')
            staff_elevated_roles = StaffElevatedRoleService.find_all()

        return jsonify(StaffElevatedRoleResponseSchema(many=True).dump(staff_elevated_roles)), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def post():
        """Create a new staff elevated role."""
        request_dict = StaffElevatedRoleBodyParamSchema().load(API.payload)
        staff_elevated_role = StaffElevatedRoleService.create(request_dict)

        return StaffElevatedRoleResponseSchema().dump(staff_elevated_role), HTTPStatus.CREATED


@cors_preflight("GET, DELETE, PUT")
@API.route("/<int:staff_elevated_role_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class StaffElevatedRole(Resource):
    """Endpoint resource to manage a staff elevated role."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(staff_elevated_role_id):
        """Return details of a staff_elevated_role."""
        StaffElevatedRoleIdPathParamSchema().load(request.view_args)
        staff_elevated_role = StaffElevatedRoleService.find_by_id(staff_elevated_role_id)

        return (
            StaffElevatedRoleResponseSchema().dump(staff_elevated_role),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(staff_elevated_role_id):
        """Update and return an staff_elevated_role."""
        StaffElevatedRoleIdPathParamSchema().load(request.view_args)
        request_json = StaffElevatedRoleBodyParamSchema().load(API.payload)
        staff_elevated_role = StaffElevatedRoleService.edit_staff_elevated_role(
            staff_elevated_role_id, request_json
        )
        return (
            StaffElevatedRoleResponseSchema().dump(staff_elevated_role),
            HTTPStatus.OK,
        )

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(staff_elevated_role_id):
        """Delete a staff elevated role"""
        StaffElevatedRoleIdPathParamSchema().load(request.view_args)
        StaffElevatedRoleService.delete(staff_elevated_role_id)

        return "Staff elevated role successfully deleted", HTTPStatus.OK
