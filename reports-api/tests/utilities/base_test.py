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

"""A helper test.

Test-Suite to ensure that the /reports endpoint is working as expected.
"""

import time

from flask import current_app


token_header = {"alg": "RS256", "typ": "JWT", "kid": "forms-flow-web"}


def get_token(
    jwt,
    role: str = "formsflow-client",
    username: str = "client",
    roles: list = [],
    tenant_key: str = None,
):
    """Return token json representation."""
    return jwt.create_jwt(
        {
            "jti": "1d8c24bd-a1a7-4251-b769-b7bd6ecd51213215",
            "exp": round(time.time() * 1000),
            "nbf": 0,
            "iat": 1635399332,
            "iss": current_app.config["JWT_OIDC_TEST_ISSUER"],
            "aud": ["camunda-rest-api", "forms-flow-web"],
            "sub": "47b46f22-45ec-4cfb-825b-ed10ba8bed01",
            "typ": "Bearer",
            "azp": "forms-flow-web",
            "auth_time": 0,
            "session_state": "6f50e760-cd96-4934-86dc-e0e667f1a407",
            "acr": "1",
            "allowed-origins": ["*"],
            "realm_access": {"roles": ["offline_access", "uma_authorization"]},
            "resource_access": {
                "forms-flow-web": {"roles": [role, *roles]},
                "account": {
                    "roles": ["manage-account", "manage-account-links", "view-profile"]
                },
            },
            "scope": "camunda-rest-api email profile",
            "roles": [role, *roles],
            "name": "John Smith",
            "preferred_username": username,
            "given_name": "John",
            "family_name": "Smith",
            "email": "formsflow-reviewer@example.com",
            "tenantKey": tenant_key,
        },
        token_header,
    )
