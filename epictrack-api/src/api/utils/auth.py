"""Bring in the common JWT Manager and helper functions."""

from functools import wraps

from flask import g, request
from flask_jwt_oidc import JwtManager

jwt = JwtManager()  # pylint: disable=invalid-name


class Auth:
    """Extending JwtManager to include additional functionalities."""

    @classmethod
    def require(cls, f):
        """Validate the Bearer Token."""

        @jwt.requires_auth
        @wraps(f)
        def decorated(*args, **kwargs):
            g.authorization_header = request.headers.get("Authorization", None)
            # current_app.logger.info(f"AUTH HEADER {g.authorization_header}")
            g.token_info = g.jwt_oidc_token_info

            return f(*args, **kwargs)

        return decorated

    @classmethod
    def has_role(cls, role):
        """Method to validate the role."""
        # pylint: disable=no-value-for-parameter
        return jwt.validate_roles(role)
        # pylint: enable=no-value-for-parameter


auth = (
    Auth()
)  # pylint: disable=invalid-name; lower case name as used by convention in most Flask apps
