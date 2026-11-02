"""Test suite for per-user rate limiting."""
from http import HTTPStatus

import pytest
from flask import g

from api.utils.rate_limit import limiter
from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header


URL = '/api/v1/staffs/exists?email=someone@gov.bc.ca'


@pytest.fixture
def rate_limited(app):
    """Enable rate limits with a tiny lookup limit for the duration of a test."""
    app.config.update(RATE_LIMITS_ENABLED=True, RATE_LIMIT_LOOKUP='2/minute')
    limiter.reset()
    yield
    app.config.update(RATE_LIMITS_ENABLED=False, RATE_LIMIT_LOOKUP='360/minute')
    limiter.reset()


def test_limit_is_per_user(client, jwt, auth_header, rate_limited):  # pylint: disable=unused-argument
    """Exceeding the limit returns 429 for that user only."""
    for _ in range(2):
        assert client.get(URL, headers=auth_header).status_code == HTTPStatus.OK

    result = client.get(URL, headers=auth_header)
    assert result.status_code == HTTPStatus.TOO_MANY_REQUESTS
    assert 'Retry-After' in result.headers

    other_user = {**TestJwtClaims.staff_admin_role, 'sub': 'another-user'}
    other_header = factory_auth_header(jwt=jwt, claims=other_user)
    assert client.get(URL, headers=other_header).status_code == HTTPStatus.OK


def test_preflight_and_ops_are_exempt(app, client, rate_limited):  # pylint: disable=unused-argument
    """CORS preflights and health probes are never limited."""
    app.config['RATE_LIMIT_DEFAULT'] = '1/minute'
    try:
        for _ in range(3):
            # An endpoint with no route limit: once a route limit has run on an endpoint, Flask-Limiter
            # stops applying the default limit there, which would hide a missing OPTIONS exemption.
            assert client.options('/api/v1/ea-acts').status_code != HTTPStatus.TOO_MANY_REQUESTS
            assert client.get('/ops/healthz').status_code == HTTPStatus.OK
    finally:
        app.config['RATE_LIMIT_DEFAULT'] = '900/minute'


def test_default_limit_returns_429(app, client, auth_header, rate_limited):  # pylint: disable=unused-argument
    """The default limit, checked before auth, also returns 429."""
    app.config['RATE_LIMIT_DEFAULT'] = '1/minute'
    try:
        for expected in (HTTPStatus.OK, HTTPStatus.TOO_MANY_REQUESTS):
            # The session-wide app context keeps g between requests; production gets a fresh one.
            g.pop('token_info', None)
            assert client.get('/api/v1/ea-acts', headers=auth_header).status_code == expected
        # Same token with a different "Bearer" spelling shares the bucket.
        token = auth_header['Authorization'].split()[-1]
        for prefix in ('bearer ', 'BEARER ', 'Bearer  '):
            g.pop('token_info', None)
            result = client.get('/api/v1/ea-acts', headers={'Authorization': prefix + token})
            assert result.status_code == HTTPStatus.TOO_MANY_REQUESTS
    finally:
        app.config['RATE_LIMIT_DEFAULT'] = '900/minute'
