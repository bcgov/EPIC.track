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
"""Test suite for Authorization Service."""
from unittest.mock import MagicMock, patch

import pytest
from flask import g
from werkzeug.exceptions import Forbidden

from api.services.authorisation import (
    check_auth,
    _normalize_role,
    _has_elevated_role,
    _has_team_membership,
)
from api.utils.roles import Membership, ElevatedRole, Role
from tests.utilities.factory_scenarios import TestJwtClaims


class TestNormalizeRole:
    """Test _normalize_role function."""

    def test_normalize_role_enum(self, app):
        """Test normalizing Role enum."""
        with app.app_context():
            result = _normalize_role(Role.CREATE)
            assert result == Role.CREATE.value

    def test_normalize_membership_enum(self, app):
        """Test normalizing Membership enum."""
        with app.app_context():
            result = _normalize_role(Membership.TEAM_MEMBER)
            assert result == Membership.TEAM_MEMBER.value

    def test_normalize_elevated_role_enum(self, app):
        """Test normalizing ElevatedRole enum."""
        with app.app_context():
            result = _normalize_role(ElevatedRole.MANAGE_FIRST_NATIONS)
            assert result == ElevatedRole.MANAGE_FIRST_NATIONS.value

    def test_normalize_string_role(self, app):
        """Test normalizing string role returns as-is."""
        with app.app_context():
            result = _normalize_role("custom_role")
            assert result == "custom_role"

    def test_normalize_none(self, app):
        """Test normalizing None returns None."""
        with app.app_context():
            result = _normalize_role(None)
            assert result is None


class TestHasElevatedRole:
    """Test _has_elevated_role function."""

    def test_has_elevated_role_no_staff(self, app, db):
        """Test returns False when staff not found."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "nonexistent@test.com"}

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = None

                    result = _has_elevated_role({ElevatedRole.MANAGE_FIRST_NATIONS.value})

                    assert result is False

    def test_has_elevated_role_no_elevated_roles(self, app, db):
        """Test returns False when staff has no elevated roles."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffElevatedRoleModel') as mock_elevated:
                        mock_elevated.find_by_params.return_value = []

                        result = _has_elevated_role({ElevatedRole.MANAGE_FIRST_NATIONS.value})

                        assert result is False

    def test_has_elevated_role_matching_role(self, app, db):
        """Test returns True when staff has matching elevated role."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                mock_elevated_role = MagicMock()
                mock_elevated_role.elevated_role_id = ElevatedRole.MANAGE_FIRST_NATIONS.value

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffElevatedRoleModel') as mock_elevated:
                        mock_elevated.find_by_params.return_value = [mock_elevated_role]

                        result = _has_elevated_role({ElevatedRole.MANAGE_FIRST_NATIONS.value})

                        assert result is True


class TestHasTeamMembership:
    """Test _has_team_membership function."""

    def test_has_team_membership_no_work_id(self, app, db):
        """Test returns False when no work_id provided."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = _has_team_membership(None, {Membership.TEAM_MEMBER.value})

            assert result is False

    def test_has_team_membership_no_staff(self, app, db):
        """Test returns False when staff not found."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "nonexistent@test.com"}

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = None

                    result = _has_team_membership(1, {Membership.TEAM_MEMBER.value})

                    assert result is False

    def test_has_team_membership_no_work_roles(self, app, db):
        """Test returns False when staff has no work roles."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffWorkRoleModel') as mock_work_role:
                        mock_work_role.find_by_params.return_value = []

                        result = _has_team_membership(1, {Membership.TEAM_MEMBER.value})

                        assert result is False

    def test_has_team_membership_team_member_permitted(self, app, db):
        """Test returns True when TEAM_MEMBER is in permitted roles and staff has work role."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                mock_work_role = MagicMock()
                mock_work_role.role_id = 1

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffWorkRoleModel') as mock_work_role_model:
                        mock_work_role_model.find_by_params.return_value = [mock_work_role]

                        result = _has_team_membership(1, {Membership.TEAM_MEMBER.value})

                        assert result is True


class TestCheckAuth:
    """Test check_auth function."""

    def test_check_auth_with_token_role(self, app, db):
        """Test returns True when user has matching token role."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = [Role.CREATE.value]

                result = check_auth(one_of_roles=[Role.CREATE])

                assert result is True

    def test_check_auth_with_membership(self, app, db):
        """Test checks team membership when membership role provided."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = []
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                mock_work_role = MagicMock()
                mock_work_role.role_id = 1

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffWorkRoleModel') as mock_work_role_model:
                        mock_work_role_model.find_by_params.return_value = [mock_work_role]

                        result = check_auth(
                            one_of_roles=[Membership.TEAM_MEMBER],
                            work_id=1
                        )

                        assert result is True

    def test_check_auth_with_elevated_role(self, app, db):
        """Test checks elevated role when no token or membership match."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = []
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                mock_staff_instance = MagicMock()
                mock_staff_instance.id = 1

                mock_elevated_role = MagicMock()
                mock_elevated_role.elevated_role_id = ElevatedRole.MANAGE_FIRST_NATIONS.value

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = mock_staff_instance

                    with patch('api.services.authorisation.StaffElevatedRoleModel') as mock_elevated:
                        mock_elevated.find_by_params.return_value = [mock_elevated_role]

                        result = check_auth(one_of_roles=[ElevatedRole.MANAGE_FIRST_NATIONS])

                        assert result is True

    def test_check_auth_forbidden(self, app, db):
        """Test aborts with 403 when no authorization matches."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = []
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = None

                    with pytest.raises(Forbidden):
                        check_auth(one_of_roles=[Role.CREATE], work_id=1)

    def test_check_auth_empty_roles(self, app, db):
        """Test with empty roles list checks elevated roles."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = []
                mock_token.get_user_data.return_value = {"email_id": "test@test.com"}

                with patch('api.services.authorisation.StaffModel') as mock_staff:
                    mock_staff.find_by_email.return_value = None

                    with pytest.raises(Forbidden):
                        check_auth(one_of_roles=[])


class TestCheckAuthIntegration:
    """Integration tests for check_auth."""

    def test_check_auth_multiple_roles(self, app, db):
        """Test check_auth with multiple role types."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch('api.services.authorisation.TokenInfo') as mock_token:
                mock_token.get_roles.return_value = [Role.EDIT.value]

                # Should pass because user has EDIT role
                result = check_auth(
                    one_of_roles=[
                        Role.CREATE,
                        Role.EDIT,
                        Membership.TEAM_MEMBER,
                    ],
                    work_id=1
                )

                assert result is True
