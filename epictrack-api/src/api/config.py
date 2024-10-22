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
"""All of the configuration for the service is captured here.

All items are loaded,
or have Constants defined here that are loaded into the Flask configuration.
All modules and lookups get their configuration from the Flask config,
rather than reading environment variables directly or by accessing this configuration directly.
"""

import os
import sys

from dotenv import find_dotenv, load_dotenv
from api.utils import constants


# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

CONFIGURATION = {
    'development': 'api.config.DevConfig',
    'testing': 'api.config.TestConfig',
    'production': 'api.config.ProdConfig',
    'default': 'api.config.ProdConfig',
    'migration': 'api.config.MigrationConfig',
}


def get_named_config(config_name: str = 'production'):
    """Return the configuration object based on the name.

    :raise: KeyError: if an unknown configuration is requested
    """
    if config_name in ['production', 'staging', 'default']:
        config = ProdConfig()
    elif config_name == 'testing':
        config = TestConfig()
    elif config_name == 'development':
        config = DevConfig()
    elif config_name == 'migration':
        config = MigrationConfig()
    else:
        raise KeyError(f"Unknown configuration '{config_name}'")
    return config


def _get_config(config_key: str, **kwargs):
    """Get the config from environment, and throw error if there are no default values and if the value is None."""
    if 'default' in kwargs:
        value = os.getenv(config_key, kwargs.get('default'))
    else:
        value = os.getenv(config_key)
        # assert value TODO Un-comment once we find a solution to run pre-hook without initializing app
    return value


class _Config():  # pylint: disable=too-few-public-methods
    """Base class configuration that should set reasonable defaults for all the other configurations."""

    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY = 'a secret'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # added to skip the event logic for the purpose of entering historical data without
    # much hurdles
    SKIP_EVENT_LOGIC = _get_config('SKIP_EVENT_LOGIC', default=False) == 'True'

    ALEMBIC_INI = 'migrations/alembic.ini'

    # POSTGRESQL
    DB_USER = _get_config('DATABASE_USERNAME')
    DB_PASSWORD = _get_config('DATABASE_PASSWORD')
    DB_NAME = _get_config('DATABASE_NAME')
    DB_HOST = _get_config('DATABASE_HOST')
    DB_PORT = _get_config('DATABASE_PORT', default='5432')
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{int(DB_PORT)}/{DB_NAME}'
    SQLALCHEMY_ECHO = _get_config('SQLALCHEMY_ECHO', default='False').lower() == 'true'

    # JWT_OIDC Settings
    JWT_OIDC_WELL_KNOWN_CONFIG = _get_config('JWT_OIDC_WELL_KNOWN_CONFIG')
    JWT_OIDC_ALGORITHMS = _get_config('JWT_OIDC_ALGORITHMS')
    JWT_OIDC_JWKS_URI = _get_config('JWT_OIDC_JWKS_URI', default=None)
    JWT_OIDC_ISSUER = _get_config('JWT_OIDC_ISSUER')
    JWT_OIDC_AUDIENCE = _get_config('JWT_OIDC_AUDIENCE')
    JWT_OIDC_CLIENT_SECRET = _get_config('JWT_OIDC_CLIENT_SECRET', default=None)
    JWT_OIDC_CACHING_ENABLED = _get_config('JWT_OIDC_CACHING_ENABLED', default=False)
    JWT_OIDC_JWKS_CACHE_TIMEOUT = int(_get_config('JWT_OIDC_JWKS_CACHE_TIMEOUT', default=300))

    KEYCLOAK_BASE_URL = _get_config('KEYCLOAK_BASE_URL')
    KEYCLOAK_REALM_NAME = _get_config('KEYCLOAK_REALM_NAME')
    KEYCLOAK_ADMIN_CLIENT = _get_config('KEYCLOAK_ADMIN_CLIENT')
    KEYCLOAK_ADMIN_SECRET = _get_config('KEYCLOAK_ADMIN_SECRET')
    CONNECT_TIMEOUT = _get_config('CONNECT_TIMEOUT', default=60)

    TESTING = False
    DEBUG = True

    CACHE_TYPE = constants.CACHE_TYPE
    CACHE_DEFAULT_TIMEOUT = constants.CACHE_DEFAULT_TIMEOUT

    MIN_WORK_START_DATE = _get_config('MIN_WORK_START_DATE', default='1995-06-30')


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Dev config."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

    # POSTGRESQL
    DB_USER = _get_config('DATABASE_TEST_USERNAME', default='postgres')
    DB_PASSWORD = _get_config('DATABASE_TEST_PASSWORD', default='postgres')
    DB_NAME = _get_config('DATABASE_TEST_NAME', default='testdb')
    DB_HOST = _get_config('DATABASE_TEST_HOST', default='localhost')
    DB_PORT = _get_config('DATABASE_TEST_PORT', default='5432')
    SQLALCHEMY_DATABASE_URI = _get_config(
        'DATABASE_TEST_URL',
        default=f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{int(DB_PORT)}/{DB_NAME}'
    )

    JWT_OIDC_TEST_MODE = True
    # JWT_OIDC_ISSUER = _get_config('JWT_OIDC_TEST_ISSUER')
    JWT_OIDC_TEST_AUDIENCE = _get_config('JWT_OIDC_TEST_AUDIENCE')
    JWT_OIDC_TEST_CLIENT_SECRET = _get_config('JWT_OIDC_TEST_CLIENT_SECRET')
    JWT_OIDC_TEST_ISSUER = _get_config('JWT_OIDC_TEST_ISSUER')
    JWT_OIDC_WELL_KNOWN_CONFIG = _get_config('JWT_OIDC_WELL_KNOWN_CONFIG')
    JWT_OIDC_TEST_ALGORITHMS = _get_config('JWT_OIDC_TEST_ALGORITHMS')
    JWT_OIDC_TEST_JWKS_URI = _get_config('JWT_OIDC_TEST_JWKS_URI', default=None)

    JWT_OIDC_TEST_KEYS = {
        'keys': [
            {
                'kid': 'epictrack',
                'kty': 'RSA',
                'alg': 'RS256',
                'use': 'sig',
                'n': 'AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-'
                     'TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR',
                'e': 'AQAB'
            }
        ]
    }

    JWT_OIDC_TEST_PRIVATE_KEY_JWKS = {
        'keys': [
            {
                'kid': 'forms-flow-ai',
                'kty': 'RSA',
                'alg': 'RS256',
                'use': 'sig',
                'n': 'AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-'
                     'TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR',
                'e': 'AQAB',
                'd': 'C0G3QGI6OQ6tvbCNYGCqq043YI_8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhskURaDwk4-'
                     '8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh_'
                     'xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0',
                'p': 'APXcusFMQNHjh6KVD_hOUIw87lvK13WkDEeeuqAydai9Ig9JKEAAfV94W6Aftka7tGgE7ulg1vo3eJoLWJ1zvKM',
                'q': 'AOjX3OnPJnk0ZFUQBwhduCweRi37I6DAdLTnhDvcPTrrNWuKPg9uGwHjzFCJgKd8KBaDQ0X1rZTZLTqi3peT43s',
                'dp': 'AN9kBoA5o6_Rl9zeqdsIdWFmv4DB5lEqlEnC7HlAP-3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhc',
                'dq': 'ANtbSY6njfpPploQsF9sU26U0s7MsuLljM1E8uml8bVJE1mNsiu9MgpUvg39jEu9BtM2tDD7Y51AAIEmIQex1nM',
                'qi': 'XLE5O360x-MhsdFXx8Vwz4304-MJg-oGSJXCK_ZWYOB_FGXFRTfebxCsSYi0YwJo-oNu96bvZCuMplzRI1liZw'
            }
        ]
    }

    JWT_OIDC_TEST_PRIVATE_KEY_PEM = """-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDfn1nKQshOSj8xw44oC2klFWSNLmK3BnHONCJ1bZfq0EQ5gIfg
tlvB+Px8Ya+VS3OnK7Cdi4iU1fxO9ktN6c6TjmmmFevk8wIwqLthmCSF3r+3+h4e
ddj7hucMsXWv05QUrCPoL6YUUz7Cgpz7ra24rpAmK5z7lsV+f3BEvXkrUQIDAQAB
AoGAC0G3QGI6OQ6tvbCNYGCqq043YI/8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhs
kURaDwk4+8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh/
xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0CQQD13LrBTEDR44ei
lQ/4TlCMPO5bytd1pAxHnrqgMnWovSIPSShAAH1feFugH7ZGu7RoBO7pYNb6N3ia
C1idc7yjAkEA6Nfc6c8meTRkVRAHCF24LB5GLfsjoMB0tOeEO9w9Ous1a4o+D24b
AePMUImAp3woFoNDRfWtlNktOqLel5PjewJBAN9kBoA5o6/Rl9zeqdsIdWFmv4DB
5lEqlEnC7HlAP+3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhcCQQDb
W0mOp436T6ZaELBfbFNulNLOzLLi5YzNRPLppfG1SRNZjbIrvTIKVL4N/YxLvQbT
NrQw+2OdQACBJiEHsdZzAkBcsTk7frTH4yGx0VfHxXDPjfTj4wmD6gZIlcIr9lZg
4H8UZcVFN95vEKxJiLRjAmj6g273pu9kK4ymXNEjWWJn
-----END RSA PRIVATE KEY-----"""
    CACHE_TYPE = constants.NULL_CACHE_TYPE

    KEYCLOAK_BASE_URL = _get_config('KEYCLOAK_BASE_URL')
    KEYCLOAK_REALM_NAME = _get_config('KEYCLOAK_REALM_NAME')
    KEYCLOAK_ADMIN_CLIENT = _get_config('KEYCLOAK_ADMIN_CLIENT')
    KEYCLOAK_ADMIN_SECRET = _get_config('KEYCLOAK_ADMIN_SECRET')


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = _get_config('SECRET_KEY', default=None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print('WARNING: SECRET_KEY being set as a one-shot', file=sys.stderr)

    TESTING = False
    DEBUG = False


class MigrationConfig(_Config):  # pylint: disable=too-few-public-methods
    """Config for db migration."""

    TESTING = False
    DEBUG = True

    # POSTGRESQL
    DB_USER = _get_config('DATABASE_USERNAME')
    DB_PASSWORD = _get_config('DATABASE_PASSWORD')
    DB_NAME = _get_config('DATABASE_NAME')
    DB_HOST = _get_config('DATABASE_HOST')
    DB_PORT = _get_config('DATABASE_PORT', default='5432')
    KEYCLOAK_BASE_URL = _get_config('KEYCLOAK_BASE_URL')
    KEYCLOAK_REALM_NAME = _get_config('KEYCLOAK_REALM_NAME')
    KEYCLOAK_ADMIN_CLIENT = _get_config('KEYCLOAK_ADMIN_CLIENT')
    KEYCLOAK_ADMIN_SECRET = _get_config('KEYCLOAK_ADMIN_SECRET')
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{int(DB_PORT)}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CACHE_TYPE = constants.NULL_CACHE_TYPE
    CACHE_DEFAULT_TIMEOUT = constants.CACHE_DEFAULT_TIMEOUT
