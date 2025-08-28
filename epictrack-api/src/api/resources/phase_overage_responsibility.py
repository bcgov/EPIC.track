"""Resource for phase_overage_responsiblities endpoints."""
from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource, cors

from api.schemas.request.phase_overage_responsibility_request import PhaseOverageResponsibilityBodyRequestSchema, PhaseOverageResponsibilityBodyUpdateRequestSchema
from api.schemas.response.phase_overage_responsibility_response import PhaseOverageResponsibilityResponseSchema
from api.services.phase_overage_responsibility_service import PhaseOverageResponsibilityService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace("overage-responsibilities", description="Work Phase Overage Responsibilities")


@cors_preflight("GET, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class PhaseOverageResponsibilities(Resource):
    """Endpoint resource to list or create responsibilities."""

    @staticmethod
    @auth.require
    @cors.crossdomain(origin="*")
    @profiletime
    def get():
        """Return responsibilities filtered by body parameters."""
        args = request.get_json(silent=True) or {}
        data = PhaseOverageResponsibilityBodyRequestSchema().load(args)
        work_phase_id = data.get("work_phase_id")
        if work_phase_id:
            responsibilities = PhaseOverageResponsibilityService.find_by_work_phase_id(
                work_phase_id, is_deleted=False
            )
        else:
            responsibilities = PhaseOverageResponsibilityService.find_all()
        return PhaseOverageResponsibilityResponseSchema(many=True).dump(responsibilities), HTTPStatus.OK

    @staticmethod
    @auth.require
    @cors.crossdomain(origin="*")
    @profiletime
    def post():
        """Create a new responsibility."""
        request_json = request.get_json()
        data = PhaseOverageResponsibilityBodyRequestSchema().load(request_json)
        responsibility = PhaseOverageResponsibilityService.create(data)
        return PhaseOverageResponsibilityResponseSchema().dump(responsibility), HTTPStatus.CREATED


@cors_preflight("GET, PUT, DELETE")
@API.route("/<int:responsibility_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class PhaseOverageResponsibility(Resource):
    """Endpoint resource to manage a single responsibility."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(responsibility_id):
        """Return a responsibility by ID."""
        responsibility = PhaseOverageResponsibilityService.find_by_id(responsibility_id)
        return PhaseOverageResponsibilityResponseSchema().dump(responsibility), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(responsibility_id):
        """Update a responsibility by ID."""
        request_json = request.get_json()
        data = PhaseOverageResponsibilityBodyUpdateRequestSchema().load(request_json)
        responsibility = PhaseOverageResponsibilityService.update(responsibility_id, data)
        return PhaseOverageResponsibilityResponseSchema().dump(responsibility), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def delete(responsibility_id):
        """Delete a responsibility by ID."""
        PhaseOverageResponsibilityService.delete(responsibility_id)
        return "Phase overage responsibility successfully deleted", HTTPStatus.OK
