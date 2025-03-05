"""Unit tests for staff-elevated-roles."""

from http import HTTPStatus
from urllib.parse import urljoin
from api.config import get_named_config

from tests.utilities.factory_scenarios import TestStaffElevatedRole, TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header, factory_elevated_role_model, factory_staff_elevated_role_model, factory_staff_model


API_BASE_URL = "/api/v1/"
CONFIG = get_named_config('testing')


def test_get_all_staff_elevated_roles(client, auth_header):
    """Test get all staff elevated roles."""
    url = urljoin(API_BASE_URL, "staff-elevated-roles")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_get_staff_elevated_role_by_id(client, auth_header):
    """Test get staff elevated role details by ID."""
    staff_elevated_role = factory_staff_elevated_role_model()
    url = urljoin(API_BASE_URL, f"staff-elevated-roles/{staff_elevated_role.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert staff_elevated_role.id == response_json["id"]
    assert staff_elevated_role.staff_id == response_json["staff_id"]
    assert staff_elevated_role.elevated_role_id == response_json["elevated_role_id"]


def test_create_staff_elevated_role(client, jwt):
    """Test create a staff elevated role."""
    staff = factory_staff_model()
    staff_elevated_role_data = TestStaffElevatedRole.staff_elevated_role1.value
    staff_elevated_role_data["staff_id"] = staff.id
    url = urljoin(API_BASE_URL, "staff-elevated-roles")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)

    response = client.post(url, json=staff_elevated_role_data, headers=headers)
    assert response.status_code == HTTPStatus.CREATED
    response_json = response.json
    assert "id" in response_json
    assert staff_elevated_role_data["staff_id"] == response_json["staff_id"]
    assert staff_elevated_role_data["elevated_role_id"] == response_json["elevated_role_id"]


def test_create_staff_elevated_role_unauthorized(client, jwt):
    """Test that unauthorized users cannot create staff elevated roles."""
    unauthorized_user = TestJwtClaims.staff_admin_role  # Without manage_users
    headers = factory_auth_header(jwt=jwt, claims=unauthorized_user)

    url = urljoin(API_BASE_URL, "staff-elevated-roles")
    data = {
        "staff_id": 1,
        "elevated_role": 1
    }

    response = client.post(url, json=data, headers=headers)
    assert response.status_code == HTTPStatus.FORBIDDEN


def test_update_staff_elevated_role(client, jwt):
    """Test update staff elevated role."""
    # Create initial role
    staff = factory_staff_model()
    staff_elevated_role_data = TestStaffElevatedRole.staff_elevated_role1.value
    staff_elevated_role_data["staff_id"] = staff.id
    url = urljoin(API_BASE_URL, "staff-elevated-roles")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)

    response = client.post(url, json=staff_elevated_role_data, headers=headers)
    assert response.status_code == HTTPStatus.CREATED

    # Update the role
    staff_elevated_role = response.json
    staff_elevated_role_id = staff_elevated_role["id"]
    updated_data = staff_elevated_role.copy()
    updated_data["is_active"] = False
    url = urljoin(API_BASE_URL, f"staff-elevated-roles/{staff_elevated_role_id}")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)
    response = client.put(url, json=updated_data, headers=headers)

    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert response_json["id"] == staff_elevated_role_id
    assert updated_data["staff_id"] == response_json["staff_id"]
    assert updated_data["elevated_role_id"] == response_json["elevated_role_id"]
    assert updated_data["is_active"] == response_json["is_active"]


def test_delete_staff_elevated_role(client, jwt):
    """Test delete staff elevated role."""
    staff_elevated_role = factory_staff_elevated_role_model()
    url = urljoin(API_BASE_URL, f"staff-elevated-roles/{staff_elevated_role.id}")
    super_user = TestJwtClaims.manage_user_role
    headers = factory_auth_header(jwt=jwt, claims=super_user)

    response = client.delete(url, headers=headers)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Staff elevated role successfully deleted"
    response = client.get(url, headers=headers)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_get_staff_elevated_roles_by_staff_id(client, auth_header):
    """Test get staff elevated roles by staff ID."""
    staff_elevated_role = factory_staff_elevated_role_model()
    url = urljoin(API_BASE_URL, f"staff-elevated-roles?staff_id={staff_elevated_role.staff_id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK


def test_get_staff_elevated_roles_by_elevated_role_id(client, auth_header):
    """Test get staff elevated roles by elevated role ID."""
    elevated_role = factory_elevated_role_model()
    url = urljoin(API_BASE_URL, f"staff-elevated-roles?elevated_role_id={elevated_role.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
