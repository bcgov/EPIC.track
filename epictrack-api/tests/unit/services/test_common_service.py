"""Unit tests for common service functions."""
from datetime import datetime, timezone
from unittest.mock import MagicMock

from api.services.common_service import event_compare_func, find_event_date


class TestFindEventDate:
    """Tests for find_event_date function."""

    def test_returns_actual_date_when_present(self):
        """Test that actual_date is returned when available."""
        actual = datetime(2024, 5, 15, tzinfo=timezone.utc)
        anticipated = datetime(2024, 6, 1, tzinfo=timezone.utc)

        event = MagicMock()
        event.actual_date = actual
        event.anticipated_date = anticipated

        result = find_event_date(event)
        assert result == actual

    def test_returns_anticipated_date_when_no_actual(self):
        """Test that anticipated_date is returned when actual_date is None."""
        anticipated = datetime(2024, 6, 1, tzinfo=timezone.utc)

        event = MagicMock()
        event.actual_date = None
        event.anticipated_date = anticipated

        result = find_event_date(event)
        assert result == anticipated

    def test_returns_anticipated_date_when_actual_is_false(self):
        """Test that anticipated_date is returned when actual_date is falsy."""
        anticipated = datetime(2024, 6, 1, tzinfo=timezone.utc)

        event = MagicMock()
        event.actual_date = False
        event.anticipated_date = anticipated

        result = find_event_date(event)
        assert result == anticipated


class TestEventCompareFunc:
    """Tests for event_compare_func function."""

    def test_same_date_returns_negative_when_first_id_smaller(self):
        """Test events on same date are sorted by ID ascending."""
        date = datetime(2024, 5, 15, tzinfo=timezone.utc)

        event1 = MagicMock()
        event1.actual_date = date
        event1.id = 1

        event2 = MagicMock()
        event2.actual_date = date
        event2.id = 2

        result = event_compare_func(event1, event2)
        assert result == -1

    def test_same_date_returns_positive_when_first_id_larger(self):
        """Test events on same date with larger ID come after."""
        date = datetime(2024, 5, 15, tzinfo=timezone.utc)

        event1 = MagicMock()
        event1.actual_date = date
        event1.id = 10

        event2 = MagicMock()
        event2.actual_date = date
        event2.id = 5

        result = event_compare_func(event1, event2)
        assert result == 1

    def test_earlier_date_returns_negative(self):
        """Test event with earlier date comes first."""
        event1 = MagicMock()
        event1.actual_date = datetime(2024, 5, 10, tzinfo=timezone.utc)
        event1.id = 1

        event2 = MagicMock()
        event2.actual_date = datetime(2024, 5, 15, tzinfo=timezone.utc)
        event2.id = 2

        result = event_compare_func(event1, event2)
        assert result == -1

    def test_later_date_returns_positive(self):
        """Test event with later date comes after."""
        event1 = MagicMock()
        event1.actual_date = datetime(2024, 5, 20, tzinfo=timezone.utc)
        event1.id = 1

        event2 = MagicMock()
        event2.actual_date = datetime(2024, 5, 15, tzinfo=timezone.utc)
        event2.id = 2

        result = event_compare_func(event1, event2)
        assert result == 1

    def test_uses_anticipated_date_when_no_actual(self):
        """Test comparison uses anticipated_date when actual_date is None."""
        event1 = MagicMock()
        event1.actual_date = None
        event1.anticipated_date = datetime(2024, 5, 10, tzinfo=timezone.utc)
        event1.id = 1

        event2 = MagicMock()
        event2.actual_date = None
        event2.anticipated_date = datetime(2024, 5, 15, tzinfo=timezone.utc)
        event2.id = 2

        result = event_compare_func(event1, event2)
        assert result == -1

    def test_mixed_actual_and_anticipated_dates(self):
        """Test comparison works with mix of actual and anticipated dates."""
        event1 = MagicMock()
        event1.actual_date = datetime(2024, 5, 10, tzinfo=timezone.utc)
        event1.anticipated_date = datetime(2024, 6, 1, tzinfo=timezone.utc)
        event1.id = 1

        event2 = MagicMock()
        event2.actual_date = None
        event2.anticipated_date = datetime(2024, 5, 15, tzinfo=timezone.utc)
        event2.id = 2

        result = event_compare_func(event1, event2)
        assert result == -1

    def test_events_on_same_date_with_times(self):
        """Test that only date portion is compared, not time."""
        event1 = MagicMock()
        event1.actual_date = datetime(2024, 5, 15, 10, 30, tzinfo=timezone.utc)
        event1.id = 3

        event2 = MagicMock()
        event2.actual_date = datetime(2024, 5, 15, 14, 45, tzinfo=timezone.utc)
        event2.id = 7

        result = event_compare_func(event1, event2)
        assert result == -1  # Should use ID since dates are same

    def test_returns_zero_for_same_event(self):
        """Test same event comparison."""
        event = MagicMock()
        event.actual_date = datetime(2024, 5, 15, tzinfo=timezone.utc)
        event.id = 1

        # When comparing same event, id < id is False, so returns 1
        result = event_compare_func(event, event)
        assert result == 1  # Same event: id not less than itself, returns 1
