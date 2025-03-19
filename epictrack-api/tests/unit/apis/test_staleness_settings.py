"""Unit tests for staleness-settings."""

from http import HTTPStatus
from urllib.parse import urljoin
from api.config import get_named_config

from api.models.staleness_settings import StalenessTypeEnum
from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header


API_BASE_URL = "/api/v1/"
CONFIG = get_named_config('testing')


def test_get_all_staleness_settings(client, auth_header):
    """Test get all staleness settings."""
    url = urljoin(API_BASE_URL, "staleness-settings")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_get_staleness_setting_by_type(client, auth_header):
    """Test get staleness setting by type."""
    url = urljoin(API_BASE_URL, f"staleness-settings/{StalenessTypeEnum.STATUS.value}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert StalenessTypeEnum.STATUS.value == response_json["staleness_type"]


def test_update_warning_length(client, jwt):
    """Test update warning length for a given type."""
    url = urljoin(API_BASE_URL, f"staleness-settings/{StalenessTypeEnum.STATUS.value}")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)
    data = {
        "warning_length": 5
    }

    response = client.put(url, json=data, headers=headers)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert StalenessTypeEnum.STATUS.value == response_json["staleness_type"]
    assert data["warning_length"] == response_json["warning_length"]


def test_update_staleness_length(client, jwt):
    """Test update staleness length for a given type."""
    url = urljoin(API_BASE_URL, f"staleness-settings/{StalenessTypeEnum.STATUS.value}")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)
    data = {
        "staleness_length": 5
    }

    response = client.put(url, json=data, headers=headers)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert StalenessTypeEnum.STATUS.value == response_json["staleness_type"]
    assert data["staleness_length"] == response_json["staleness_length"]


def test_unauthorized_update_warning_length(client, jwt):
    """Test that unauthorized users cannot update warning length."""
    unauthorized_user = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=unauthorized_user)

    url = urljoin(API_BASE_URL, f"staleness-settings/{StalenessTypeEnum.STATUS.value}")
    data = {
        "warning_length": 5
    }

    response = client.put(url, json=data, headers=headers)
    assert response.status_code == HTTPStatus.FORBIDDEN
