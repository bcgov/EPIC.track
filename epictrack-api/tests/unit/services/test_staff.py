"""Unit tests for Staff Service."""
from datetime import datetime
from io import BytesIO
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from api.exceptions import ResourceNotFoundError
from api.services.staff import StaffService


class TestFindByPositionId:
    """Tests for find_by_position_id method."""

    @patch("api.services.staff.Staff")
    def test_finds_staff_by_position_id(self, mock_staff_model):
        """Test finding staff by position ID."""
        position_id = 10
        mock_staff1 = MagicMock(id=1, first_name="John", position_id=position_id)
        mock_staff2 = MagicMock(id=2, first_name="Jane", position_id=position_id)
        mock_staff_model.find_active_staff_by_position.return_value = [mock_staff1, mock_staff2]

        result = StaffService.find_by_position_id(position_id)

        assert len(result) == 2
        mock_staff_model.find_active_staff_by_position.assert_called_once_with(position_id)


class TestFindByPositionIds:
    """Tests for find_by_position_ids method."""

    @patch("api.services.staff.Staff")
    def test_finds_active_staff_when_include_inactive_false(self, mock_staff_model):
        """Test finding only active staff by position IDs."""
        position_ids = [1, 2, 3]
        mock_staff = [MagicMock(id=1), MagicMock(id=2)]
        mock_staff_model.find_active_staff_by_positions.return_value = mock_staff

        result = StaffService.find_by_position_ids(position_ids, include_inactive=False)

        assert result == mock_staff
        mock_staff_model.find_active_staff_by_positions.assert_called_once_with(position_ids)
        mock_staff_model.find_all_staff_by_positions.assert_not_called()

    @patch("api.services.staff.Staff")
    def test_finds_all_staff_when_include_inactive_true(self, mock_staff_model):
        """Test finding all staff including inactive by position IDs."""
        position_ids = [1, 2, 3]
        mock_staff = [MagicMock(id=1), MagicMock(id=2), MagicMock(id=3)]
        mock_staff_model.find_all_staff_by_positions.return_value = mock_staff

        result = StaffService.find_by_position_ids(position_ids, include_inactive=True)

        assert result == mock_staff
        mock_staff_model.find_all_staff_by_positions.assert_called_once_with(position_ids)
        mock_staff_model.find_active_staff_by_positions.assert_not_called()


class TestFindAllActiveStaff:
    """Tests for find_all_active_staff method."""

    @patch("api.services.staff.StaffResponseSchema")
    @patch("api.services.staff.Staff")
    def test_returns_all_active_staff(self, mock_staff_model, mock_schema):
        """Test finding all active staff."""
        mock_staffs = [MagicMock(id=1), MagicMock(id=2)]
        mock_staff_model.find_all_active_staff.return_value = mock_staffs
        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.dump.return_value = [{"id": 1}, {"id": 2}]

        result = StaffService.find_all_active_staff()

        assert "staffs" in result
        assert result["staffs"] == [{"id": 1}, {"id": 2}]
        mock_staff_model.find_all_active_staff.assert_called_once()
        mock_schema.assert_called_once_with(many=True)


class TestFindAllNonDeletedStaff:
    """Tests for find_all_non_deleted_staff method."""

    @patch("api.services.staff.Staff")
    def test_finds_inactive_and_active_staff(self, mock_staff_model):
        """Test finding all non-deleted staff."""
        mock_staffs = [MagicMock(id=1), MagicMock(id=2)]
        mock_staff_model.find_all_non_deleted_staff.return_value = mock_staffs

        result = StaffService.find_all_non_deleted_staff(is_active=False)

        assert result == mock_staffs
        mock_staff_model.find_all_non_deleted_staff.assert_called_once_with(False)


class TestCreateStaff:
    """Tests for create_staff method."""

    @patch("api.services.staff.StaffService.create_staff_special_fields")
    @patch("api.services.staff.StaffService.validate_email_and_get_idir_user_id")
    @patch("api.services.staff.Staff")
    def test_creates_staff_with_normalized_email(
        self, mock_staff_model, mock_validate, mock_create_fields
    ):
        """Test creating staff normalizes email and validates."""
        payload = {
            "email": "Test.User@Example.COM",
            "first_name": "Test",
            "last_name": "User",
        }
        mock_validate.return_value = "idir123"
        mock_staff_instance = MagicMock()
        mock_staff_instance.flush.return_value = mock_staff_instance
        mock_staff_model.return_value = mock_staff_instance

        StaffService.create_staff(payload)

        # Email should be lowercased by the service
        mock_validate.assert_called_once_with("test.user@example.com")
        assert payload["idir_user_id"] == "idir123"
        mock_validate.assert_called_once_with("test.user@example.com")
        mock_staff_instance.flush.assert_called_once()
        mock_create_fields.assert_called_once_with(mock_staff_instance)
        mock_staff_instance.save.assert_called_once()

    @patch("api.services.staff.StaffService.validate_email_and_get_idir_user_id")
    @patch("api.services.staff.Staff")
    def test_create_staff_raises_when_validation_fails(self, mock_staff_model, mock_validate):
        """Test create_staff raises error when email validation fails."""
        payload = {"email": "invalid@test.com", "first_name": "Test"}
        mock_validate.side_effect = ResourceNotFoundError("User not found in Keycloak")

        with pytest.raises(ResourceNotFoundError):
            StaffService.create_staff(payload)


class TestUpdateStaff:
    """Tests for update_staff method."""

    @patch("api.services.staff.StaffService.validate_email_and_get_idir_user_id")
    @patch("api.services.staff.Staff")
    def test_updates_staff_with_same_email(self, mock_staff_model, mock_validate):
        """Test updating staff without email change."""
        staff_id = 5
        mock_staff = MagicMock()
        mock_staff.email = "test@example.com"
        mock_staff_model.find_by_id.return_value = mock_staff
        mock_staff.update.return_value = mock_staff

        payload = {"email": "test@example.com", "first_name": "Updated"}

        result = StaffService.update_staff(staff_id, payload)

        assert result == mock_staff
        mock_validate.assert_not_called()
        mock_staff.update.assert_called_once_with(payload)

    @patch("api.services.staff.StaffService.validate_email_and_get_idir_user_id")
    @patch("api.services.staff.Staff")
    def test_updates_staff_with_new_email(self, mock_staff_model, mock_validate):
        """Test updating staff with new email validates and updates idir."""
        staff_id = 5
        mock_staff = MagicMock()
        mock_staff.email = "old@example.com"
        mock_staff_model.find_by_id.return_value = mock_staff
        mock_staff.update.return_value = mock_staff
        mock_validate.return_value = "new_idir"

        payload = {"email": "NEW@example.com", "first_name": "Updated"}

        StaffService.update_staff(staff_id, payload)

        assert payload["idir_user_id"] == "new_idir"
        # Email should be lowercased by the service
        mock_validate.assert_called_once_with("new@example.com")
        mock_validate.assert_called_once_with("new@example.com")
        mock_staff.update.assert_called_once_with(payload)

    @patch("api.services.staff.Staff")
    def test_update_staff_raises_when_not_found(self, mock_staff_model):
        """Test update_staff raises error when staff not found."""
        staff_id = 999
        mock_staff_model.find_by_id.return_value = None
        payload = {"email": "test@example.com"}

        with pytest.raises(ResourceNotFoundError, match="Staff with id '999' not found"):
            StaffService.update_staff(staff_id, payload)


class TestUpdateLastActive:
    """Tests for update_last_active method."""

    @patch("api.services.staff.datetime")
    @patch("api.services.staff.Staff")
    def test_updates_last_active_time(self, mock_staff_model, mock_datetime):
        """Test updating staff's last active timestamp."""
        staff_id = 10
        now = datetime(2024, 5, 15, 10, 30)
        mock_datetime.now.return_value = now
        mock_staff = MagicMock()
        mock_staff_model.find_by_id.return_value = mock_staff

        StaffService.update_last_active(staff_id)

        assert mock_staff.last_active_at == now
        mock_staff.save.assert_called_once()


class TestDeleteStaff:
    """Tests for delete_staff method."""

    @patch("api.services.staff.Staff")
    def test_marks_staff_as_deleted(self, mock_staff_model):
        """Test soft deleting staff."""
        staff_id = 5
        mock_staff = MagicMock()
        mock_staff_model.find_by_id.return_value = mock_staff

        result = StaffService.delete_staff(staff_id)

        assert result is True
        assert mock_staff.is_deleted is True
        mock_staff_model.commit.assert_called_once()


class TestFindById:
    """Tests for find_by_id method."""

    @patch("api.services.staff.db")
    def test_finds_staff_by_id(self, mock_db):
        """Test finding staff by ID."""
        staff_id = 5
        mock_staff = MagicMock(id=staff_id)
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.one_or_none.return_value = mock_staff

        result = StaffService.find_by_id(staff_id)

        assert result == mock_staff

    @patch("api.services.staff.db")
    def test_find_by_id_excludes_deleted_when_requested(self, mock_db):
        """Test finding staff excludes deleted when flag is True."""
        staff_id = 5
        mock_staff = MagicMock(id=staff_id)
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.one_or_none.return_value = mock_staff

        result = StaffService.find_by_id(staff_id, exclude_deleted=True)

        assert result == mock_staff
        # Should be called twice: once for ID, once for is_deleted filter
        assert mock_query.filter.call_count == 2

    @patch("api.services.staff.db")
    def test_find_by_id_raises_when_not_found(self, mock_db):
        """Test finding staff raises error when not found."""
        staff_id = 999
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.one_or_none.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Staff with id '999' not found"):
            StaffService.find_by_id(staff_id)


class TestCheckExistence:
    """Tests for check_existence method."""

    @patch("api.services.staff.Staff")
    def test_checks_if_staff_exists(self, mock_staff_model):
        """Test checking staff existence."""
        email = "test@example.com"
        staff_id = 5
        mock_staff_model.check_existence.return_value = True

        result = StaffService.check_existence(email, staff_id)

        assert result is True
        mock_staff_model.check_existence.assert_called_once_with(email, staff_id)


class TestFindByEmail:
    """Tests for find_by_email method."""

    @patch("api.services.staff.Staff")
    def test_finds_staff_by_email(self, mock_staff_model):
        """Test finding staff by email address."""
        email = "test@example.com"
        mock_staff = MagicMock(email=email)
        mock_staff_model.find_by_email.return_value = mock_staff

        result = StaffService.find_by_email(email)

        assert result == mock_staff
        mock_staff_model.find_by_email.assert_called_once_with(email)


class TestImportStaffs:
    """Tests for import_staffs method."""

    @patch("api.services.staff.StaffService._update_or_delete_old_data")
    @patch("api.services.staff.StaffService._read_excel")
    @patch("api.services.staff.db")
    @patch("api.services.staff.TokenInfo")
    def test_imports_staff_from_excel(self, mock_token, mock_db, mock_read_excel, mock_update):
        """Test importing staff from Excel file."""
        mock_file = BytesIO()
        # Position IDs should already be integers after DataFrame processing
        data = pd.DataFrame({
            "first_name": ["John", "Jane"],
            "last_name": ["Doe", "Smith"],
            "email": ["john@test.com", "jane@test.com"],
            "position_id": [10, 20],  # Already resolved position IDs
            "created_by": ["admin", "admin"]
        })
        mock_read_excel.return_value = pd.DataFrame({
            "first_name": ["John", "Jane"],
            "last_name": ["Doe", "Smith"],
            "email": ["john@test.com", "jane@test.com"],
            "position_id": ["Manager", "Developer"],
        })
        mock_update.return_value = data
        mock_token.get_username.return_value = "admin"

        mock_position1 = MagicMock()
        mock_position1.name = "Manager"
        mock_position1.id = 10
        mock_position2 = MagicMock()
        mock_position2.name = "Developer"
        mock_position2.id = 20
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [mock_position1, mock_position2]

        result = StaffService.import_staffs(mock_file)

        assert result == "Inserted successfully"
        mock_read_excel.assert_called_once_with(mock_file)
        mock_db.session.bulk_insert_mappings.assert_called_once()
        mock_db.session.commit.assert_called_once()


class TestReadExcel:
    """Tests for _read_excel private method."""

    def test_reads_and_transforms_excel_data(self):
        """Test reading Excel file and transforming columns."""
        data = {
            "First Name": ["John", "Jane"],
            "Last Name": ["Doe", "Smith"],
            "Phone": ["123-456-7890", "098-765-4321"],
            "Email": ["john@test.com", "jane@test.com"],
            "Position": ["Manager", "Developer"],
        }
        df = pd.DataFrame(data)

        # Create Excel file in memory
        excel_buffer = BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)

        result = StaffService._read_excel(excel_buffer)

        assert "first_name" in result.columns
        assert "last_name" in result.columns
        assert "phone" in result.columns
        assert "email" in result.columns
        assert "position_id" in result.columns
        assert len(result) == 2


class TestFindPositionId:
    """Tests for _find_position_id private method."""

    def test_finds_position_by_name(self):
        """Test finding position ID by name."""
        position1 = MagicMock()
        position1.name = "Manager"
        position1.id = 10
        position2 = MagicMock()
        position2.name = "Developer"
        position2.id = 20
        positions = [position1, position2]

        result = StaffService._find_position_id("Manager", positions)

        assert result == 10

    def test_returns_none_when_name_is_none(self):
        """Test returns None when position name is None."""
        position = MagicMock()
        position.name = "Manager"
        position.id = 10
        positions = [position]

        result = StaffService._find_position_id(None, positions)

        assert result is None

    def test_raises_when_position_not_found(self):
        """Test raises error when position name doesn't exist."""
        position = MagicMock()
        position.name = "Manager"
        position.id = 10
        positions = [position]

        with pytest.raises(ResourceNotFoundError, match="position with name Unknown does not exist"):
            StaffService._find_position_id("Unknown", positions)


class TestUpdateOrDeleteOldData:
    """Tests for _update_or_delete_old_data private method."""

    @patch("api.services.staff.db")
    @patch("api.services.staff.current_app")
    def test_marks_removed_staff_as_deleted(self, mock_app, mock_db):
        """Test marks staff not in import data as deleted."""
        data = pd.DataFrame({
            "email": ["john@test.com", "jane@test.com"],
            "first_name": ["John", "Jane"],
        })

        # Mock existing staff
        existing1 = MagicMock(email="john@test.com")
        existing2 = MagicMock(email="removed@test.com")

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [existing1, existing2]
        mock_query.update.return_value = 1

        result = StaffService._update_or_delete_old_data(data)

        # Returns filtered data (non-existing staffs removed)
        assert isinstance(result, pd.DataFrame)
        # update is called twice: once for to_delete, once for to_update
        assert mock_query.update.call_count == 2
        # Verify first call was for deletions
        first_call_args = mock_query.update.call_args_list[0][0][0]
        assert first_call_args["is_deleted"] is True
        assert first_call_args["is_active"] is False
