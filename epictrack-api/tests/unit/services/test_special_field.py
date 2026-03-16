"""Unit tests for Special Field Service."""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from psycopg2.extras import DateTimeTZRange

from api.exceptions import ResourceNotFoundError, BadRequestError
from api.services.special_field import SpecialFieldService


class TestFindAllByParams:
    """Tests for find_all_by_params method."""

    @patch("api.services.special_field.SpecialField")
    def test_finds_special_fields_by_params(self, mock_model):
        """Test finding special fields by parameters."""
        params = {"entity": "WORK", "entity_id": 10}
        mock_fields = [MagicMock(id=1), MagicMock(id=2)]
        mock_model.find_by_params.return_value = mock_fields

        result = SpecialFieldService.find_all_by_params(params)

        assert result == mock_fields
        mock_model.find_by_params.assert_called_once_with(params)


class TestCreateSpecialFieldEntry:
    """Tests for create_special_field_entry method."""

    @patch("api.services.special_field.SpecialFieldService._update_original_model")
    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.SpecialFieldService._get_upper_limit")
    @patch("api.services.special_field.db")
    @patch("api.services.special_field.SpecialField")
    def test_creates_special_field_with_time_range(
        self, mock_model, mock_db, mock_get_upper, mock_check_auth, mock_update_model
    ):
        """Test creating special field entry with time range."""
        active_from = datetime(2024, 1, 1, tzinfo=timezone.utc)
        upper_limit = datetime(2024, 12, 31, tzinfo=timezone.utc)

        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead",
            "active_from": active_from,
        }

        mock_get_upper.return_value = upper_limit
        mock_instance = MagicMock()
        mock_model.return_value = mock_instance

        SpecialFieldService.create_special_field_entry(payload, commit=True, work_id=10)

        assert "active_from" not in payload
        assert "time_range" in payload
        assert isinstance(payload["time_range"], DateTimeTZRange)
        mock_check_auth.assert_called_once()
        mock_db.session.add.assert_called_once_with(mock_instance)
        mock_db.session.flush.assert_called_once()
        mock_update_model.assert_called_once_with(mock_instance)
        mock_db.session.commit.assert_called_once()

    @patch("api.services.special_field.SpecialFieldService._update_original_model")
    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.SpecialFieldService._get_upper_limit")
    @patch("api.services.special_field.db")
    @patch("api.services.special_field.SpecialField")
    def test_creates_without_commit_when_requested(
        self, mock_model, mock_db, mock_get_upper, mock_check_auth, mock_update_model
    ):
        """Test creating special field without committing."""
        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead",
            "active_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        }
        mock_get_upper.return_value = None
        mock_instance = MagicMock()
        mock_model.return_value = mock_instance

        SpecialFieldService.create_special_field_entry(payload, commit=False)

        mock_db.session.flush.assert_called_once()
        mock_db.session.commit.assert_not_called()


class TestUpdateSpecialFieldEntry:
    """Tests for update_special_field_entry method."""

    @patch("api.services.special_field.SpecialFieldService._adjust_special_field_end_dates")
    @patch("api.services.special_field.SpecialFieldService._update_original_model")
    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.SpecialFieldService._get_upper_limit")
    @patch("api.services.special_field.SpecialField")
    @patch("api.services.special_field.db")
    def test_updates_special_field_entry(
        self, mock_db, mock_model, mock_get_upper, mock_check_auth, mock_update_model, mock_adjust
    ):
        """Test updating special field entry."""
        special_field_id = 5
        active_from = datetime(2024, 1, 1, tzinfo=timezone.utc)
        upper_limit = datetime(2024, 12, 31, tzinfo=timezone.utc)

        payload = {
            "field_name": "lead",
            "active_from": active_from,
        }

        mock_special_field = MagicMock()
        mock_model.find_by_id.return_value = mock_special_field
        mock_get_upper.return_value = upper_limit
        mock_special_field.update.return_value = mock_special_field

        result = SpecialFieldService.update_special_field_entry(
            special_field_id, payload, commit=True
        )

        assert result == mock_special_field
        mock_check_auth.assert_called_once_with(special_field=mock_special_field)
        mock_special_field.update.assert_called_once()
        mock_update_model.assert_called_once_with(mock_special_field)
        mock_db.session.commit.assert_called_once()
        mock_adjust.assert_called_once_with(payload)

    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.SpecialFieldService._get_upper_limit")
    @patch("api.services.special_field.SpecialField")
    def test_update_raises_when_not_found(self, mock_model, mock_get_upper, mock_check_auth):
        """Test update raises error when special field not found."""
        special_field_id = 999
        mock_model.find_by_id.return_value = None
        payload = {"field_name": "lead", "active_from": datetime(2024, 1, 1, tzinfo=timezone.utc)}
        mock_get_upper.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Special field entry with id '999' not found"):
            SpecialFieldService.update_special_field_entry(special_field_id, payload)


class TestDeleteSpecialFieldEntry:
    """Tests for delete_special_field_entry method."""

    @patch("api.services.special_field.SpecialFieldService._update_original_model")
    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.db")
    @patch("api.services.special_field.SpecialField")
    def test_deletes_most_recent_entry_and_updates_previous(
        self, mock_model, mock_db, mock_check_auth, mock_update_model
    ):
        """Test deleting most recent entry extends previous entry."""
        special_field_id = 3

        # Create mock entries
        entry1 = MagicMock(
            id=1,
            time_range=DateTimeTZRange(
                datetime(2024, 1, 1, tzinfo=timezone.utc),
                datetime(2024, 6, 30, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        entry2 = MagicMock(
            id=2,
            time_range=DateTimeTZRange(
                datetime(2024, 7, 1, tzinfo=timezone.utc),
                datetime(2024, 12, 31, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        to_delete = MagicMock(
            id=special_field_id,
            entity="WORK",
            entity_id=10,
            field_name="lead",
            time_range=DateTimeTZRange(
                datetime(2025, 1, 1, tzinfo=timezone.utc),
                None,
                bounds='[)'
            )
        )

        mock_model.find_by_id.return_value = to_delete

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter_by.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [entry1, entry2, to_delete]

        result = SpecialFieldService.delete_special_field_entry(special_field_id)

        assert result == to_delete
        mock_check_auth.assert_called_once_with(special_field=to_delete)
        mock_db.session.delete.assert_called_once_with(to_delete)
        mock_db.session.commit.assert_called_once()
        # Previous entry should be updated to have no upper limit
        mock_db.session.add.assert_called_once_with(entry2)
        mock_update_model.assert_called_once()

    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.db")
    @patch("api.services.special_field.SpecialField")
    def test_delete_raises_when_only_one_entry(self, mock_model, mock_db, mock_check_auth):
        """Test cannot delete the only entry."""
        special_field_id = 1
        to_delete = MagicMock(
            id=special_field_id,
            entity="WORK",
            entity_id=10,
            field_name="lead"
        )

        mock_model.find_by_id.return_value = to_delete
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter_by.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [to_delete]

        with pytest.raises(BadRequestError, match="Cannot delete the only special history entry"):
            SpecialFieldService.delete_special_field_entry(special_field_id)

    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.SpecialField")
    def test_delete_raises_when_not_found(self, mock_model, mock_check_auth):
        """Test delete raises error when entry not found."""
        special_field_id = 999
        mock_model.find_by_id.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Special field entry with id '999' not found"):
            SpecialFieldService.delete_special_field_entry(special_field_id)

    @patch("api.services.special_field.SpecialFieldService._check_auth")
    @patch("api.services.special_field.db")
    @patch("api.services.special_field.SpecialField")
    def test_deletes_middle_entry_and_extends_next(
        self, mock_model, mock_db, mock_check_auth
    ):
        """Test deleting middle entry extends next entry to cover gap."""
        special_field_id = 2

        entry1 = MagicMock(
            id=1,
            time_range=DateTimeTZRange(
                datetime(2024, 1, 1, tzinfo=timezone.utc),
                datetime(2024, 6, 30, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        to_delete = MagicMock(
            id=special_field_id,
            entity="WORK",
            entity_id=10,
            field_name="lead",
            time_range=DateTimeTZRange(
                datetime(2024, 7, 1, tzinfo=timezone.utc),
                datetime(2024, 12, 31, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        entry3 = MagicMock(
            id=3,
            time_range=DateTimeTZRange(
                datetime(2025, 1, 1, tzinfo=timezone.utc),
                None,
                bounds='[)'
            )
        )

        mock_model.find_by_id.return_value = to_delete
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter_by.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [entry1, to_delete, entry3]

        SpecialFieldService.delete_special_field_entry(special_field_id)

        # Next entry should be updated with new lower bound
        mock_db.session.add.assert_called_once_with(entry3)
        mock_db.session.delete.assert_called_once_with(to_delete)
        mock_db.session.commit.assert_called_once()


class TestFindById:
    """Tests for find_by_id method."""

    @patch("api.services.special_field.SpecialField")
    def test_finds_special_field_by_id(self, mock_model):
        """Test finding special field by ID."""
        special_field_id = 5
        mock_field = MagicMock(id=special_field_id)
        mock_model.find_by_id.return_value = mock_field

        result = SpecialFieldService.find_by_id(special_field_id)

        assert result == mock_field
        mock_model.find_by_id.assert_called_once_with(special_field_id)


class TestAdjustSpecialFieldEndDates:
    """Tests for _adjust_special_field_end_dates private method."""

    @patch("api.services.special_field.db")
    def test_adjusts_end_dates_for_sequential_entries(self, mock_db):
        """Test adjusting end dates to align with next entry's start."""
        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead"
        }

        field1 = MagicMock(
            time_range=DateTimeTZRange(
                datetime(2024, 1, 1, tzinfo=timezone.utc),
                datetime(2024, 6, 30, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        field2 = MagicMock(
            time_range=DateTimeTZRange(
                datetime(2024, 7, 1, tzinfo=timezone.utc),
                datetime(2024, 12, 31, tzinfo=timezone.utc),
                bounds='[)'
            )
        )
        field3 = MagicMock(
            time_range=DateTimeTZRange(
                datetime(2025, 1, 1, tzinfo=timezone.utc),
                None,
                bounds='[)'
            )
        )

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_existing_query = MagicMock()
        mock_existing_query.order_by.return_value = mock_ordered_query = MagicMock()
        mock_ordered_query.all.return_value = [field1, field2, field3]

        SpecialFieldService._adjust_special_field_end_dates(payload)

        # Last entry should not be modified (has None upper bound)
        # First two entries should have updated time_range
        mock_db.session.commit.assert_called_once()


class TestGetUpperLimit:
    """Tests for _get_upper_limit private method."""

    @patch("api.services.special_field.db")
    def test_returns_none_when_no_existing_entry(self, mock_db):
        """Test returns None when no overlapping entries exist."""
        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead",
            "active_from": datetime(2024, 1, 1, tzinfo=timezone.utc)
        }

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = None

        result = SpecialFieldService._get_upper_limit(payload)

        assert result is None

    @patch("api.services.special_field.db")
    def test_returns_upper_limit_when_entry_exists_before(self, mock_db):
        """Test returns day before next entry when it exists after."""
        active_from = datetime(2024, 1, 1, tzinfo=timezone.utc)
        next_start = datetime(2024, 7, 1, tzinfo=timezone.utc)

        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead",
            "active_from": active_from
        }

        existing_entry = MagicMock()
        existing_entry.time_range = MagicMock(lower=next_start, upper=None)

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = existing_entry

        result = SpecialFieldService._get_upper_limit(payload)

        expected = next_start - timedelta(days=1)
        assert result == expected

    @patch("api.services.special_field.db")
    def test_excludes_current_entry_when_updating(self, mock_db):
        """Test excludes current special field when calculating upper limit on update."""
        payload = {
            "entity": "WORK",
            "entity_id": 10,
            "field_name": "lead",
            "active_from": datetime(2024, 1, 1, tzinfo=timezone.utc)
        }

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = None

        # Call with special_field_id to simulate update
        result = SpecialFieldService._get_upper_limit(payload, special_field_id=5)

        assert result is None
        # Should have been called with additional filter for id != 5
        assert mock_query.filter.call_count >= 1
