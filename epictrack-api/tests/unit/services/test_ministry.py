"""Unit tests for Ministry Service."""
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

import pytest

from api.services.ministry import MinistryService
from api.exceptions import ResourceNotFoundError


class TestFindAll:
    """Tests for find_all method."""

    @patch("api.services.ministry.Ministry")
    def test_returns_all_active_ministries(self, mock_model):
        """Test returning all active ministries."""
        mock_ministries = [
            MagicMock(id=1, name="Ministry A"),
            MagicMock(id=2, name="Ministry B"),
        ]
        mock_model.find_all.return_value = mock_ministries

        result = MinistryService.find_all()

        assert len(result) == 2
        mock_model.find_all.assert_called_once()


class TestCreateMinistry:
    """Tests for create_ministry method."""

    @patch("api.services.ministry.MinistryService.create_special_fields")
    @patch("api.services.ministry.MinistryService._check_create_auth")
    @patch("api.services.ministry.Ministry")
    def test_creates_ministry_with_incremented_sort_order(
        self, mock_model, mock_check_auth, mock_create_special
    ):
        """Test creating ministry with correct sort order."""
        ministry_dict = {
            "name": "New Ministry",
            "abbreviation": "NM",
            "minister_id": 1,
        }

        # Mock existing ministry with highest sort order
        mock_existing = MagicMock(sort_order=5)
        mock_model.query.order_by.return_value.first.return_value = mock_existing

        mock_ministry = MagicMock()
        mock_ministry.flush.return_value = mock_ministry
        mock_model.return_value = mock_ministry

        MinistryService.create_ministry(ministry_dict)

        mock_check_auth.assert_called_once()
        assert ministry_dict["sort_order"] == 6  # 5 + 1
        mock_ministry.flush.assert_called_once()
        mock_create_special.assert_called_once_with(mock_ministry)
        mock_ministry.save.assert_called_once()

    @patch("api.services.ministry.MinistryService.create_special_fields")
    @patch("api.services.ministry.MinistryService._check_create_auth")
    @patch("api.services.ministry.Ministry")
    def test_creates_first_ministry(self, mock_model, mock_check_auth, mock_create_special):
        """Test creating first ministry when no others exist."""
        ministry_dict = {
            "name": "First Ministry",
            "abbreviation": "FM",
        }

        # Mock no existing ministry
        mock_existing = MagicMock(sort_order=0)
        mock_model.query.order_by.return_value.first.return_value = mock_existing

        mock_ministry = MagicMock()
        mock_ministry.flush.return_value = mock_ministry
        mock_model.return_value = mock_ministry

        MinistryService.create_ministry(ministry_dict)

        assert ministry_dict["sort_order"] == 1


class TestUpdateMinistry:
    """Tests for update_ministry method."""

    @patch("api.services.ministry.MinistryService._check_create_auth")
    @patch("api.services.ministry.Ministry")
    def test_updates_ministry(self, mock_model, mock_check_auth):
        """Test updating an existing ministry."""
        ministry_id = 5
        ministry_dict = {"name": "Updated Ministry"}

        mock_ministry = MagicMock(id=ministry_id)
        mock_model.find_by_id.return_value = mock_ministry

        result = MinistryService.update_ministry(ministry_id, ministry_dict)

        mock_check_auth.assert_called_once()
        mock_model.find_by_id.assert_called_once_with(ministry_id)
        mock_ministry.update.assert_called_once_with(ministry_dict)
        mock_ministry.save.assert_called_once()
        assert result == mock_ministry

    @patch("api.services.ministry.MinistryService._check_create_auth")
    @patch("api.services.ministry.Ministry")
    def test_raises_error_when_ministry_not_found(self, mock_model, mock_check_auth):
        """Test raises error when ministry not found."""
        ministry_id = 999
        ministry_dict = {"name": "Updated"}

        mock_model.find_by_id.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Ministry not found"):
            MinistryService.update_ministry(ministry_id, ministry_dict)


class TestCreateSpecialFields:
    """Tests for create_special_fields method."""

    @patch("api.services.special_field.SpecialFieldService.create_special_field_entry")
    def test_creates_all_special_fields(self, mock_create_entry):
        """Test creating all special fields for ministry."""
        mock_ministry = MagicMock(
            id=1,
            name="Test Ministry",
            abbreviation="TM",
            minister_id=10,
            date_created=datetime(2024, 1, 1, tzinfo=timezone.utc),
        )

        MinistryService.create_special_fields(mock_ministry)

        # Should create 3 special fields: name, abbreviation, minister_id
        assert mock_create_entry.call_count == 3

    @patch("api.services.special_field.SpecialFieldService.create_special_field_entry")
    def test_special_field_name_entry(self, mock_create_entry):
        """Test creating name special field with correct data."""
        mock_ministry = MagicMock(
            id=1,
            abbreviation="TM",
            minister_id=10,
            date_created=datetime(2024, 1, 1, tzinfo=timezone.utc),
        )
        mock_ministry.name = "Test Ministry"

        MinistryService.create_special_fields(mock_ministry)

        calls = mock_create_entry.call_args_list
        # First call is for name
        name_call = calls[0][0][0]
        assert name_call["entity"] == "MINISTRY"
        assert name_call["entity_id"] == 1
        assert name_call["field_name"] == "name"
        assert name_call["field_value"] == "Test Ministry"

    @patch("api.services.special_field.SpecialFieldService.create_special_field_entry")
    def test_special_fields_commit_false(self, mock_create_entry):
        """Test special fields are created with commit=False."""
        mock_ministry = MagicMock(
            id=1,
            name="Test",
            abbreviation="T",
            minister_id=1,
            date_created=datetime(2024, 1, 1, tzinfo=timezone.utc),
        )

        MinistryService.create_special_fields(mock_ministry)

        # All calls should have commit=False
        for call in mock_create_entry.call_args_list:
            assert call[1]["commit"] is False


class TestCheckCreateAuth:
    """Tests for _check_create_auth method."""

    @patch("api.services.ministry.authorisation")
    def test_checks_manage_users_role(self, mock_auth):
        """Test checking for MANAGE_USERS role."""
        MinistryService._check_create_auth()

        mock_auth.check_auth.assert_called_once()
        call_kwargs = mock_auth.check_auth.call_args[1]
        assert "one_of_roles" in call_kwargs
