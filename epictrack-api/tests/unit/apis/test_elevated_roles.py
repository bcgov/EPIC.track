"""Test suite for Elevated Role endpoints."""

from http import HTTPStatus
from urllib.parse import urljoin
from api.config import get_named_config

API_BASE_URL = "/api/v1/"
CONFIG = get_named_config("testing")


def test_get_all_elevated_roles(client, auth_header):
    """Test get all elevated roles."""
    url = urljoin(API_BASE_URL, "elevated-roles")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert isinstance(response_json, list)
    assert len(response_json) > 0
    assert "id" in response_json[0]
    assert "name" in response_json[0]
