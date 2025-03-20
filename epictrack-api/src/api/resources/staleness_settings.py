"""Resource for Staleness Settings endpoints."""
from http import HTTPStatus

from flask import jsonify
from flask_restx import Namespace, Resource, cors

from api.services.staleness_settings import StalenessSettingsService as StalenessSettings
from api.schemas.request.staleness_settings_request import StalenessSettingsBodyParamSchema
from api.schemas.response.staleness_settings_response import StalenessSettingsResponseSchema
from api.utils import auth, profiletime
from api.utils.util import cors_preflight

API = Namespace("staleness-settings", description="Staleness Settings")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class StalenessSettingsResource(Resource):
    """Endpoint resource to return all staleness settings"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all staleness settings."""
        settings = StalenessSettings.find_all_active()

        return jsonify(StalenessSettingsResponseSchema(many=True).dump(settings)), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<string:staleness_type>", methods=["GET", "OPTIONS"])
class StalenessSettingResource(Resource):
    """Endpoint resource to return a staleness setting by type"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(staleness_type):
        """Return staleness setting by type."""
        setting = StalenessSettings.find_by_type(staleness_type)
        return (
            StalenessSettingsResponseSchema().dump(setting),
            HTTPStatus.OK,
        )


@cors_preflight("PUT")
@API.route("/<string:staleness_type>", methods=["PUT", "OPTIONS"])
class UpdateWarningLengthResource(Resource):
    """Endpoint resource to update warning_length for a given type"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def put(staleness_type):
        """Update warning_length for a given type."""
        request_json = StalenessSettingsBodyParamSchema().load(API.payload)
        setting = StalenessSettings.edit_staleness_settings(staleness_type, request_json)
        return (
            StalenessSettingsResponseSchema().dump(setting),
            HTTPStatus.OK,
        )
