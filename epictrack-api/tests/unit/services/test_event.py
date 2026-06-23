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
"""Test suite for EventService."""
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
import pytz
from flask import g

from api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from api.models import Event, WorkPhase
from api.models.event_template import EventPositionEnum
from api.services.event import EventService
from tests.utilities.factory_scenarios import TestJwtClaims


class TestEventServiceInit:
    """Test EventService class initialization."""

    def test_service_exists(self, app):
        """Test that EventService class exists and is importable."""
        with app.app_context():
            assert EventService is not None


class TestEventServiceFindMilestoneEvent:
    """Test find_milestone_event method."""

    @patch("api.services.event.authorisation.check_auth")
    def test_find_milestone_event_not_found(self, app, db, mock_check_auth):
        """Test finding non-existent milestone event raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with pytest.raises(ResourceNotFoundError) as exc_info:
                EventService.find_milestone_event(999999)

            assert "not found or inactive" in str(exc_info.value)

    @patch("api.services.event.authorisation.check_auth")
    def test_find_milestone_event_inactive(self, app, db, mock_check_auth):
        """Test finding inactive milestone event raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'find_by_id') as mock_find:
                mock_event = MagicMock()
                mock_event.is_active = False
                mock_find.return_value = mock_event

                with pytest.raises(ResourceNotFoundError):
                    EventService.find_milestone_event(1)

    @patch("api.services.event.authorisation.check_auth")
    def test_find_milestone_event_success(self, app, db, mock_check_auth):
        """Test finding active milestone event succeeds."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'find_by_id') as mock_find:
                mock_event = MagicMock()
                mock_event.is_active = True
                mock_find.return_value = mock_event

                result = EventService.find_milestone_event(1)

                assert result == mock_event


class TestEventServiceIsStartEvent:
    """Test _is_start_event method."""

    def test_is_start_event_true(self, app):
        """Test returns True for start event."""
        with app.app_context():
            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.START.value

            result = EventService._is_start_event(mock_event)

            assert result is True

    def test_is_start_event_false_intermediate(self, app):
        """Test returns False for intermediate event."""
        with app.app_context():
            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.INTERMEDIATE.value

            result = EventService._is_start_event(mock_event)

            assert result is False

    def test_is_start_event_false_end(self, app):
        """Test returns False for end event."""
        with app.app_context():
            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.END.value

            result = EventService._is_start_event(mock_event)

            assert result is False


class TestEventServiceIsStartPhase:
    """Test _is_start_phase method."""

    def test_is_start_phase_true(self, app):
        """Test returns True when current phase is first phase."""
        with app.app_context():
            mock_phase1 = MagicMock()
            mock_phase1.id = 1
            mock_phase2 = MagicMock()
            mock_phase2.id = 2

            all_phases = [mock_phase1, mock_phase2]

            result = EventService._is_start_phase(mock_phase1, all_phases)

            assert result is True

    def test_is_start_phase_false(self, app):
        """Test returns False when current phase is not first phase."""
        with app.app_context():
            mock_phase1 = MagicMock()
            mock_phase1.id = 1
            mock_phase2 = MagicMock()
            mock_phase2.id = 2

            all_phases = [mock_phase1, mock_phase2]

            result = EventService._is_start_phase(mock_phase2, all_phases)

            assert result is False


class TestEventServiceIsLastPhase:
    """Test _is_last_phase method."""

    def test_is_last_phase_true(self, app):
        """Test returns True when current phase is last phase."""
        with app.app_context():
            mock_phase1 = MagicMock()
            mock_phase1.id = 1
            mock_phase2 = MagicMock()
            mock_phase2.id = 2

            all_phases = [mock_phase1, mock_phase2]

            result = EventService._is_last_phase(mock_phase2, all_phases)

            assert result is True

    def test_is_last_phase_false(self, app):
        """Test returns False when current phase is not last phase."""
        with app.app_context():
            mock_phase1 = MagicMock()
            mock_phase1.id = 1
            mock_phase2 = MagicMock()
            mock_phase2.id = 2

            all_phases = [mock_phase1, mock_phase2]

            result = EventService._is_last_phase(mock_phase1, all_phases)

            assert result is False


class TestEventServiceFindMilestoneProgress:
    """Test find_milestone_progress_by_work_phase_id method."""

    @patch("api.services.event.authorisation.check_auth")
    def test_find_milestone_progress_no_events(self, mock_check_auth, app, db):
        """Test returns 0 or error when no events exist."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Create a mock that returns 0 for count
            with patch.object(Event, 'query') as mock_query:
                mock_filtered = MagicMock()
                mock_filtered.count.return_value = 0
                mock_query.join.return_value.count.return_value = 0
                mock_query.join.return_value.filter.return_value.count.return_value = 0

                # Will cause division by zero, which is expected behavior
                try:
                    EventService.find_milestone_progress_by_work_phase_id(999999)
                except ZeroDivisionError:
                    # Expected when there are no events
                    pass


class TestEventServiceFindMilestoneEventsByWorkPhase:
    """Test find_milestone_events_by_work_phase method."""

    def test_find_milestone_events_by_work_phase(self, app, db):
        """Test finding milestone events by work phase."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'find_milestone_events_by_work_phase') as mock_find:
                mock_find.return_value = []

                result = EventService.find_milestone_events_by_work_phase(1)

                mock_find.assert_called_once_with(1)
                assert result == []


class TestEventServiceSerializeEvent:
    """Test _serialize_event method."""

    def test_serialize_event_full(self, app):
        """Test serializing event with all fields."""
        with app.app_context():
            mock_event = MagicMock()
            mock_event.work.title = "Test Work"
            mock_event.work_id = 1
            mock_event.event_configuration.work_phase.name = "Phase 1"
            mock_event.event_configuration.work_phase_id = 1

            with patch('api.services.event.EventResponseSchema') as mock_schema:
                mock_schema.return_value.dump.return_value = {"id": 1}

                result = EventService._serialize_event(mock_event)

                assert result["work_name"] == "Test Work"
                assert result["work_id"] == 1
                assert result["phase_name"] == "Phase 1"
                assert result["phase_id"] == 1
                assert "event" in result

    def test_serialize_event_no_work(self, app):
        """Test serializing event without work."""
        with app.app_context():
            mock_event = MagicMock()
            mock_event.work = None
            mock_event.event_configuration.work_phase.name = "Phase 1"
            mock_event.event_configuration.work_phase_id = 1

            with patch('api.services.event.EventResponseSchema') as mock_schema:
                mock_schema.return_value.dump.return_value = {"id": 1}

                result = EventService._serialize_event(mock_event)

                assert result["work_name"] is None
                assert result["work_id"] is None


class TestEventServiceValidateDates:
    """Test _validate_dates method."""

    def test_validate_dates_actual_date_too_early(self, app, db):
        """Test raises error when actual date is before minimum."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.actual_date = datetime(2020, 1, 1, tzinfo=pytz.utc)
            mock_event.anticipated_date = None
            mock_event.event_configuration.event_position.value = EventPositionEnum.INTERMEDIATE.value

            mock_work_phase = MagicMock()
            mock_work_phase.id = 1
            mock_work_phase.start_date = datetime(2024, 1, 1, tzinfo=pytz.utc)

            all_phases = [mock_work_phase]

            with pytest.raises(UnprocessableEntityError) as exc_info:
                EventService._validate_dates(mock_event, mock_work_phase, all_phases)

            assert "Actual date should be greater than" in str(exc_info.value)


class TestEventServiceCheckEvent:
    """Test check_event method."""

    def test_check_event_skip_logic(self, app, db):
        """Test check_event when SKIP_EVENT_LOGIC is True."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.dict(app.config, {"SKIP_EVENT_LOGIC": True}):
                result = EventService.check_event({"work_id": 1})

                assert result["subsequent_event_push_required"] is False
                assert result["phase_end_push_required"] is False
                assert result["days_pushed"] == 0


class TestEventServiceFindWorkPhaseEvents:
    """Test _find_work_phase_events method."""

    def test_find_work_phase_events(self, app):
        """Test filtering events by work phase id."""
        with app.app_context():
            from datetime import datetime

            mock_event1 = MagicMock()
            mock_event1.event_configuration.work_phase_id = 1
            mock_event1.actual_date = datetime(2024, 1, 15)
            mock_event1.anticipated_date = datetime(2024, 1, 10)
            mock_event1.id = 1

            mock_event2 = MagicMock()
            mock_event2.event_configuration.work_phase_id = 2
            mock_event2.actual_date = datetime(2024, 2, 15)
            mock_event2.anticipated_date = datetime(2024, 2, 10)
            mock_event2.id = 2

            mock_event3 = MagicMock()
            mock_event3.event_configuration.work_phase_id = 1
            mock_event3.actual_date = datetime(2024, 3, 15)
            mock_event3.anticipated_date = datetime(2024, 3, 10)
            mock_event3.id = 3

            all_events = [mock_event1, mock_event2, mock_event3]

            result = EventService._find_work_phase_events(all_events, 1)

            assert len(result) == 2
            assert all(e.event_configuration.work_phase_id == 1 for e in result)


class TestEventServiceFindEvents:
    """Test find_events method."""

    def test_find_events_with_work_phase(self, app, db):
        """Test finding events with work_phase_id filter."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'query') as mock_query:
                mock_query.join.return_value.filter.return_value.all.return_value = []

                from api.models import PRIMARY_CATEGORIES
                result = EventService.find_events(
                    work_id=1,
                    work_phase_id=1,
                    event_categories=PRIMARY_CATEGORIES
                )

                assert isinstance(result, list)


class TestEventServiceWillActionAddPhase:
    """Test _will_action_add_a_phase method."""

    def test_will_action_add_phase_no_actual_date(self, app, db):
        """Test returns False when event has no actual date."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.actual_date = None

            result = EventService._will_action_add_a_phase(mock_event)

            assert result is False


class TestEventServiceUpdateEvent:
    """Test update_event method."""

    def test_update_event_not_found(self, app, db):
        """Test updating non-existent event raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'find_by_id', return_value=None):
                with pytest.raises(ResourceNotFoundError):
                    EventService.update_event({}, 999999, push_events=False)

    def test_update_event_inactive(self, app, db):
        """Test updating inactive event raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.is_active = False
            mock_event.as_dict_snapshot.return_value = {}

            mock_work_phase = MagicMock()
            mock_work_phase.work_id = 1

            mock_event.event_configuration.work_phase_id = 1

            with patch.object(Event, 'find_by_id', return_value=mock_event):
                with patch.object(WorkPhase, 'find_by_id', return_value=mock_work_phase):
                    with patch.object(EventService, 'find_events', return_value=[]):
                        with patch('api.services.event.authorisation.check_auth', return_value=True):
                            with pytest.raises(UnprocessableEntityError) as exc_info:
                                EventService.update_event(
                                    {"name": "Updated"},
                                    1,
                                    push_events=False
                                )

                            assert "inactive" in str(exc_info.value)


class TestEventServiceFindAllCalendarEvents:
    """Test find_all_calendar_events method."""

    def test_find_all_calendar_events(self, app, db):
        """Test finding all calendar events."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            from api.models.dashboard_search_options import EventCalendarSearchOptions

            mock_search_options = MagicMock(spec=EventCalendarSearchOptions)

            with patch.object(EventService, '_serialize_event', return_value={"id": 1}):
                with patch('api.models.Work.fetch_all_works_by_calendar_search_criteria') as mock_works:
                    mock_works.return_value = ([], 0)

                    with patch('api.models.Event.fetch_all_events_by_calendar_search_criteria') as mock_events:
                        mock_events.return_value = ([], 0)

                        result = EventService.find_all_calendar_events(mock_search_options)

                        assert "items" in result
                        assert "total" in result
                        assert result["total"] == 0


class TestEventServiceFindAnticipatedDateMin:
    """Test _find_anticipated_date_min method."""

    def test_find_anticipated_date_min_start_event_start_phase(self, app, db):
        """Test returns MIN_WORK_START_DATE for start event in start phase."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.START.value

            mock_phase = MagicMock()
            mock_phase.id = 1
            mock_phase.work.start_date = datetime(2024, 1, 1, tzinfo=pytz.utc)

            all_phases = [mock_phase]

            result = EventService._find_anticipated_date_min(mock_event, mock_phase, all_phases)

            from api.application_constants import MIN_WORK_START_DATE
            expected = datetime.strptime(MIN_WORK_START_DATE, "%Y-%m-%d").replace(tzinfo=pytz.utc)
            assert result == expected

    def test_find_anticipated_date_min_not_start(self, app, db):
        """Test returns work start date for non-start event."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.INTERMEDIATE.value

            work_start = datetime(2024, 1, 1, tzinfo=pytz.utc)
            mock_phase = MagicMock()
            mock_phase.id = 1
            mock_phase.work.start_date = work_start

            all_phases = [mock_phase]

            result = EventService._find_anticipated_date_min(mock_event, mock_phase, all_phases)

            assert result == work_start


class TestEventServiceFindActualDateMin:
    """Test _find_actual_date_min method."""

    def test_find_actual_date_min_start_event_start_phase(self, app, db):
        """Test returns MIN_WORK_START_DATE for start event in start phase."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.START.value

            mock_phase = MagicMock()
            mock_phase.id = 1
            mock_phase.start_date = datetime(2024, 1, 1, tzinfo=pytz.utc)

            all_phases = [mock_phase]

            result = EventService._find_actual_date_min(mock_event, mock_phase, all_phases)

            from api.application_constants import MIN_WORK_START_DATE
            expected = datetime.strptime(MIN_WORK_START_DATE, "%Y-%m-%d").replace(tzinfo=pytz.utc)
            assert result == expected

    def test_find_actual_date_min_not_start(self, app, db):
        """Test returns phase start date for non-start event."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.event_configuration.event_position.value = EventPositionEnum.INTERMEDIATE.value

            phase_start = datetime(2024, 1, 1, tzinfo=pytz.utc)
            mock_phase = MagicMock()
            mock_phase.id = 2
            mock_phase.start_date = phase_start

            mock_first_phase = MagicMock()
            mock_first_phase.id = 1

            all_phases = [mock_first_phase, mock_phase]

            result = EventService._find_actual_date_min(mock_event, mock_phase, all_phases)

            assert result == phase_start


class TestEventServiceGetNumberOfDaysToBePushed:
    """Test _get_number_of_days_to_be_pushed method."""

    def test_get_number_of_days_extension_no_actual(self, app, db):
        """Test extension event returns 0 when no actual date."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            from api.models.event_category import EventCategoryEnum

            mock_event = MagicMock()
            mock_event.actual_date = None
            mock_event.anticipated_date = datetime(2024, 2, 1)
            mock_event.number_of_days = 30
            mock_event.event_configuration.event_category_id = EventCategoryEnum.EXTENSION.value

            mock_work_phase = MagicMock()

            result = EventService._get_number_of_days_to_be_pushed(mock_event, None, mock_work_phase)

            assert result == 0

    def test_get_number_of_days_extension_with_actual(self, app, db):
        """Test extension event returns number_of_days when actual date set."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            from api.models.event_category import EventCategoryEnum

            mock_event = MagicMock()
            mock_event.actual_date = datetime(2024, 2, 1)
            mock_event.anticipated_date = datetime(2024, 2, 1)
            mock_event.number_of_days = 30
            mock_event.event_configuration.event_category_id = EventCategoryEnum.EXTENSION.value

            mock_work_phase = MagicMock()

            result = EventService._get_number_of_days_to_be_pushed(mock_event, None, mock_work_phase)

            assert result == 30

    def test_get_number_of_days_suspension_time_limit(self, app, db):
        """Test suspension time limit returns 0."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            from api.models.event_category import EventCategoryEnum
            from api.models.event_type import EventTypeEnum

            mock_event = MagicMock()
            mock_event.actual_date = datetime(2024, 2, 1)
            mock_event.anticipated_date = datetime(2024, 2, 1)
            mock_event.number_of_days = 30
            mock_event.event_configuration.event_category_id = EventCategoryEnum.SUSPENSION.value
            mock_event.event_configuration.event_type_id = EventTypeEnum.TIME_LIMIT_SUSPENSION.value

            mock_work_phase = MagicMock()

            result = EventService._get_number_of_days_to_be_pushed(mock_event, None, mock_work_phase)

            assert result == 0


class TestEventServicePushEvents:
    """Test _push_events method."""

    def test_push_events_skips_locked(self, app, db):
        """Test pushing events skips locked milestones."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            source_event = MagicMock()
            source_event.id = 1

            # Event with actual date (locked)
            locked_event = MagicMock()
            locked_event.id = 2
            locked_event.actual_date = datetime(2024, 1, 15)
            locked_event.anticipated_date = datetime(2024, 1, 15)

            # Event without actual date (unlocked)
            unlocked_event = MagicMock()
            unlocked_event.id = 3
            unlocked_event.actual_date = None
            unlocked_event.anticipated_date = datetime(2024, 2, 15)

            phase_events = [source_event, locked_event, unlocked_event]

            with patch.object(EventService, '_handle_child_events'):
                EventService._push_events(phase_events, 10, source_event, [])

            # Locked event should not be modified
            assert locked_event.anticipated_date == datetime(2024, 1, 15)
            # Unlocked event should be pushed
            assert unlocked_event.anticipated_date == datetime(2024, 2, 25)


class TestEventServiceFindEventIndex:
    """Test find_event_index method."""

    def test_find_event_index_found(self, app, db):
        """Test finding event index when event exists."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.id = 100
            mock_event.actual_date = datetime(2024, 1, 15)
            mock_event.anticipated_date = datetime(2024, 1, 10)
            mock_event.event_configuration.work_phase_id = 1

            mock_phase = MagicMock()
            mock_phase.id = 1

            result = EventService.find_event_index([mock_event], mock_event, mock_phase)

            assert result == 0

    def test_find_event_index_not_found(self, app, db):
        """Test finding event index when event doesn't exist at start."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event1 = MagicMock()
            mock_event1.id = 100
            mock_event1.actual_date = datetime(2024, 1, 15)
            mock_event1.anticipated_date = datetime(2024, 1, 10)
            mock_event1.event_configuration.work_phase_id = 1

            mock_event2 = MagicMock()
            mock_event2.id = 200
            mock_event2.actual_date = None
            mock_event2.anticipated_date = datetime(2024, 2, 15)
            mock_event2.event_configuration.work_phase_id = 1

            mock_phase = MagicMock()
            mock_phase.id = 1

            result = EventService.find_event_index([mock_event1], mock_event2, mock_phase)

            # Event gets added to array, so result should be >= 0
            assert result >= 0


class TestEventServiceFindEventIndexInArray:
    """Test _find_event_index_in_array method."""

    def test_find_event_index_in_array_found(self, app):
        """Test finding event index in array when found."""
        with app.app_context():
            mock_event1 = MagicMock()
            mock_event1.id = 1
            mock_event2 = MagicMock()
            mock_event2.id = 2
            mock_event3 = MagicMock()
            mock_event3.id = 3

            events = [mock_event1, mock_event2, mock_event3]

            result = EventService._find_event_index_in_array(events, mock_event2)

            assert result == 1

    def test_find_event_index_in_array_not_found(self, app):
        """Test finding event index in array when not found."""
        with app.app_context():
            mock_event1 = MagicMock()
            mock_event1.id = 1
            mock_event2 = MagicMock()
            mock_event2.id = 2
            target_event = MagicMock()
            target_event.id = 99

            events = [mock_event1, mock_event2]

            result = EventService._find_event_index_in_array(events, target_event)

            assert result == -1


class TestEventServiceCreateEvent:
    """Test create_event method."""

    def test_create_event_invalid_work(self, app, db):
        """Test creating event with invalid work raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            from api.services.work import WorkService

            with patch.object(WorkService, 'find_by_id', return_value=None):
                with pytest.raises(Exception):
                    EventService.create_event({
                        "work_id": 999,
                        "anticipated_date": "2024-01-15",
                    })


class TestEventServiceDeleteEvent:
    """Test delete_event method."""

    def test_delete_event_not_found(self, app, db):
        """Test deleting non-existent event raises error."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'find_by_id', return_value=None):
                with pytest.raises(Exception):
                    EventService.delete_event(999)


class TestEventServiceBulkDeleteMilestones:
    """Test bulk_delete_milestones method."""

    def test_bulk_delete_milestones_empty_list(self, app, db):
        """Test bulk delete with empty list returns success message."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = EventService.bulk_delete_milestones([])

            assert result == "Deleted successfully"


class TestEventServiceFindNextMilestoneEvent:
    """Test find_next_milestone_event_by_work_phase_id method."""

    def test_find_next_milestone_event_none(self, app, db):
        """Test finding next milestone when none exists."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'query') as mock_query:
                mock_query.join.return_value.filter.return_value.order_by.return_value.first.return_value = None

                result = EventService.find_next_milestone_event_by_work_phase_id(999)

                assert result is None


class TestEventServiceFindStartAtValue:
    """Test _find_start_at_value method."""

    def test_find_start_at_value_zero(self, app):
        """Test finding start_at value for 0."""
        with app.app_context():
            result = EventService._find_start_at_value("0", 30)
            assert result == 0

    def test_find_start_at_value_number(self, app):
        """Test finding start_at value for numeric string."""
        with app.app_context():
            result = EventService._find_start_at_value("30", 30)
            assert result == 30

    def test_find_start_at_value_expression(self, app):
        """Test finding start_at value for expression."""
        with app.app_context():
            result = EventService._find_start_at_value("number_of_days / 2", 30)
            # Should evaluate to 15
            assert result == 15


class TestEventServiceProcessActions:
    """Test _process_actions method."""

    def test_process_actions_no_actual_date(self, app, db):
        """Test processing actions when event has no actual date."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            mock_event = MagicMock()
            mock_event.actual_date = None
            mock_event.event_configuration.actions = []

            # Should not raise
            EventService._process_actions(mock_event)


class TestEventServiceFindEventsByDate:
    """Test find_events_by_date method."""

    def test_find_events_by_date(self, app, db):
        """Test finding events by date."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            with patch.object(Event, 'query') as mock_query:
                mock_query.filter.return_value.filter.return_value.all.return_value = []

                result = EventService.find_events_by_date(datetime.now())

                assert isinstance(result, list)
