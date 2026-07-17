"""Unit tests for phase_overage_responsibilities endpoints."""

from http import HTTPStatus
from urllib.parse import urljoin
from api.config import get_named_config
from api.models.responsibility import Responsibility
from api.models.role import Role
from api.models.staff_work_role import StaffWorkRole
from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header, factory_staff_model, factory_work_phase_model

API_BASE_URL = "/api/v1/overage-responsibilities"
CONFIG = get_named_config("testing")


def test_get_all_responsibilities(client, jwt):
    """Test GET /overage-responsibilities"""
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.staff_admin_role)
    url = urljoin(API_BASE_URL, "")
    response = client.get(url, headers=headers)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert isinstance(response_json, list)


def test_get_with_work_phase_id_filter(client, jwt):
    """Test GET /overage-responsibilities with work_phase_id filter"""
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.staff_admin_role)
    payload = {"work_phase_id": 1}
    url = urljoin(API_BASE_URL, "")
    response = client.get(url, headers=headers, json=payload)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert isinstance(response_json, list)


def test_create_phase_overage_responsibility(session, client, jwt):
    """Test POST /overage-responsibilities"""
    work_phase = factory_work_phase_model()
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.staff_admin_role)
    payload = {
        "work_phase_id": work_phase.id,
        "responsibility": session.query(Responsibility).first().name,
    }
    url = urljoin(API_BASE_URL, "")
    response = client.post(url, headers=headers, json=payload)
    assert response.status_code == HTTPStatus.CREATED


def test_cannot_create_phase_overage_as_non_superuser_non_team_member(session, client, jwt):
    """Test POST /overage-responsibilities"""
    work_phase = factory_work_phase_model()
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.view_only_role)
    payload = {
        "work_phase_id": work_phase.id,
        "responsibility": session.query(Responsibility).first().name,
    }
    url = urljoin(API_BASE_URL, "")
    response = client.post(url, headers=headers, json=payload)
    assert response.status_code == HTTPStatus.FORBIDDEN


def test_team_member_can_create_phase_overage(session, client, jwt):
    """Test POST /overage-responsibilities"""
    work_phase = factory_work_phase_model()
    staff = factory_staff_model()
    # Team member check is done with email and work_id
    staff.email = TestJwtClaims.manage_user_role.value["email"]
    session.add(staff)
    session.commit()

    staff_work = StaffWorkRole(
        staff_id=staff.id,
        work_id=work_phase.work_id,
        role_id=session.query(Role).first().id
    )
    session.add(staff_work)
    session.commit()

    headers = factory_auth_header(jwt=jwt, claims={**TestJwtClaims.manage_user_role, "staff_id": staff.id})
    payload = {
        "work_phase_id": work_phase.id,
        "responsibility": session.query(Responsibility).first().name,
        "work_id": work_phase.work_id,
    }
    url = urljoin(API_BASE_URL, "")
    response = client.post(url, headers=headers, json=payload)
    assert response.status_code == HTTPStatus.CREATED
