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
"""The Reports API service.

This module is the API for the EAO Reports system.
"""

import logging
import os
from http import HTTPStatus

from flask import Flask, current_app
from flask_restx import abort
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from api import config
from api.config import _Config
from api.exceptions import PermissionDeniedError, ResourceExistsError, ResourceNotFoundError, UnprocessableEntityError
from api.models import db
from api.utils.auth import jwt
from api.utils.caching import AppCache
from api.utils.json_encoder import CustomJSONEncoder
from api.utils.logging import setup_logging
from api.utils.run_version import get_run_version


setup_logging(os.path.join(_Config.PROJECT_ROOT, 'logging.conf'))


def create_app(run_mode=os.getenv('FLASK_ENV', 'production')):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(config.CONFIGURATION[run_mode])
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    app.logger.info(f'Current log level: {log_level}')
    app.logger.setLevel(getattr(logging, log_level, logging.INFO))  # pylint: disable=no-member
    app.json_provider_class = CustomJSONEncoder

    db.init_app(app)

    if run_mode != 'migration':
        AppCache.configure_cache(run_mode, app)
        # pylint: disable=import-outside-toplevel
        from api.resources import API_BLUEPRINT, OPS_BLUEPRINT

        app.register_blueprint(API_BLUEPRINT)
        app.register_blueprint(OPS_BLUEPRINT)

        setup_jwt_manager(app, jwt)

        @app.after_request
        def add_version(response):  # pylint: disable=unused-variable
            version = get_run_version()
            response.headers['API'] = f'eao_epictrack_api/{version}'
            # So that ERR responses don't raise CORS error in browser
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response

        @app.errorhandler(Exception)
        def handle_error(err):
            if run_mode != "production":
                # To get stacktrace in local development for internal server errors
                raise err
            current_app.logger.error(str(err))
            return 'Internal server error', HTTPStatus.INTERNAL_SERVER_ERROR

        register_shellcontext(app)

    return app


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""

    def get_roles(a_dict):
        realm_access = a_dict.get('realm_access', {})
        realm_roles = realm_access.get('roles', [])

        client_name = current_app.config.get('JWT_OIDC_AUDIENCE')

        resource_access = a_dict.get('resource_access', {})
        client_roles = resource_access.get(client_name, {}).get('roles', [])

        return realm_roles + client_roles

    app.config['JWT_ROLE_CALLBACK'] = get_roles

    jwt_manager.init_app(app)


def register_shellcontext(app):
    """Register shell context objects."""
    from api import models  # pylint: disable=import-outside-toplevel

    def shell_context():
        """Shell context objects."""
        return {'app': app, 'jwt': jwt, 'db': db, 'models': models}  # pragma: no cover

    app.shell_context_processor(shell_context)
