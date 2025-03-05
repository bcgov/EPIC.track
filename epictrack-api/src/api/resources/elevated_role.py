"""Resource for Elevated Role endpoints."""
from http import HTTPStatus

from flask import current_app, jsonify
from flask_restx import Namespace, Resource, cors

from api.schemas import response as res
from api.services.elevated_role import ElevatedRoleService
from api.utils import auth, constants, profiletime
from api.utils.caching import AppCache
from api.utils.util import cors_preflight

API = Namespace("elevated-roles", description="Elevated Roles")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class ElevatedRoles(Resource):
    """Endpoint resource to return elevated roles"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    @AppCache.cache.cached(timeout=constants.CACHE_DAY_TIMEOUT, query_string=True)
    def get():
        """Return all elevated roles."""
        roles = ElevatedRoleService.find_all()
        return jsonify(res.ListTypeResponseSchema(many=True).dump(roles)), HTTPStatus.OK
