"""Unit tests for User Service."""
import sys
from unittest.mock import patch

import pytest

from api.services.user import UserService


class TestGetAllUsers:
    """Tests for get_all_users method."""

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.UserService.get_groups")
    @patch("api.services.user.KeycloakService")
    def test_returns_users_with_groups(self, mock_keycloak, mock_get_groups, mock_check_auth):
        """Test returning all users with their groups."""
        mock_users = [
            {"id": "user1", "username": "john"},
            {"id": "user2", "username": "jane"},
        ]
        mock_keycloak.get_users.return_value = mock_users

        mock_group = {"id": "group1", "name": "Admin", "attributes": {"level": ["10"]}}
        mock_get_groups.return_value = [mock_group]

        mock_keycloak.get_group_members.return_value = [{"id": "user1"}]

        result = UserService.get_all_users()

        assert len(result) == 2
        mock_check_auth.assert_called_once()
        mock_keycloak.get_users.assert_called_once()

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.UserService.get_groups")
    @patch("api.services.user.KeycloakService")
    def test_assigns_highest_level_group(self, mock_keycloak, mock_get_groups, mock_check_auth):
        """Test user gets assigned to highest level group."""
        mock_users = [{"id": "user1", "username": "john"}]
        mock_keycloak.get_users.return_value = mock_users

        mock_groups = [
            {"id": "group1", "name": "User", "attributes": {"level": ["5"]}},
            {"id": "group2", "name": "Admin", "attributes": {"level": ["10"]}},
        ]
        mock_get_groups.return_value = mock_groups

        # User is member of both groups
        mock_keycloak.get_group_members.side_effect = [
            [{"id": "user1"}],  # Group 1 members
            [{"id": "user1"}],  # Group 2 members
        ]

        result = UserService.get_all_users()

        # User should be assigned to Admin (higher level)
        assert result[0]["group"]["name"] == "Admin"

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.UserService.get_groups")
    @patch("api.services.user.KeycloakService")
    def test_user_without_group(self, mock_keycloak, mock_get_groups, mock_check_auth):
        """Test user without any group membership."""
        mock_users = [{"id": "user1", "username": "john"}]
        mock_keycloak.get_users.return_value = mock_users

        mock_groups = [{"id": "group1", "name": "Admin", "attributes": {"level": ["10"]}}]
        mock_get_groups.return_value = mock_groups

        # User is not a member of any group
        mock_keycloak.get_group_members.return_value = []

        result = UserService.get_all_users()

        assert result[0]["group"] is None


class TestGetGroups:
    """Tests for get_groups method."""

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.KeycloakService")
    @patch("api.services.user.current_app")
    def test_returns_track_subgroups(self, mock_app, mock_keycloak, mock_check_auth):
        """Test returning subgroups of TRACK group."""
        mock_groups = [
            {"name": "TRACK", "id": "track-id", "subGroupCount": 2},
            {"name": "OTHER", "id": "other-id", "subGroupCount": 1},
        ]
        mock_keycloak.get_groups.return_value = mock_groups

        mock_subgroups = [
            {"id": "sub1", "name": "Admin"},
            {"id": "sub2", "name": "User"},
        ]
        mock_keycloak.get_sub_groups.return_value = mock_subgroups

        result = UserService.get_groups()

        assert len(result) == 2
        mock_keycloak.get_sub_groups.assert_called_once_with("track-id")

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.KeycloakService")
    @patch("api.services.user.current_app")
    def test_ignores_non_track_groups(self, mock_app, mock_keycloak, mock_check_auth):
        """Test ignoring groups that are not TRACK."""
        mock_groups = [
            {"name": "OTHER", "id": "other-id", "subGroupCount": 5},
        ]
        mock_keycloak.get_groups.return_value = mock_groups

        result = UserService.get_groups()

        assert len(result) == 0
        mock_keycloak.get_sub_groups.assert_not_called()

    @patch("api.services.user.UserService._check_auth")
    @patch("api.services.user.KeycloakService")
    @patch("api.services.user.current_app")
    def test_handles_empty_subgroups(self, mock_app, mock_keycloak, mock_check_auth):
        """Test handling TRACK group with no subgroups."""
        mock_groups = [
            {"name": "TRACK", "id": "track-id", "subGroupCount": 0},
        ]
        mock_keycloak.get_groups.return_value = mock_groups

        result = UserService.get_groups()

        assert len(result) == 0


class TestGetLevel:
    """Tests for _get_level method."""

    def test_returns_level_from_group(self):
        """Test extracting level from group attributes."""
        group = {"attributes": {"level": ["10"]}}

        result = UserService._get_level(group)

        assert result == 10

    def test_returns_negative_max_for_missing_level(self):
        """Test returns -sys.maxsize for missing level."""
        group = {"attributes": {}}

        result = UserService._get_level(group)

        assert result == -sys.maxsize

    @patch("api.services.user.current_app")
    def test_handles_invalid_level_value(self, mock_app):
        """Test handling non-integer level value raises ValueError."""
        group = {"attributes": {"level": ["invalid"]}}

        # ValueError is not caught by _get_level, so it propagates
        with pytest.raises(ValueError):
            UserService._get_level(group)

    @patch("api.services.user.current_app")
    def test_handles_empty_level_list(self, mock_app):
        """Test handling empty level list raises IndexError."""
        group = {"attributes": {"level": []}}

        # Empty list causes IndexError when indexing [0]
        with pytest.raises(IndexError):
            UserService._get_level(group)


class TestCheckAuth:
    """Tests for _check_auth method."""

    @patch("api.services.user.authorisation")
    def test_checks_manage_users_role(self, mock_auth):
        """Test checking for MANAGE_USERS role."""
        UserService._check_auth()

        mock_auth.check_auth.assert_called_once()
        call_kwargs = mock_auth.check_auth.call_args[1]
        assert "one_of_roles" in call_kwargs
