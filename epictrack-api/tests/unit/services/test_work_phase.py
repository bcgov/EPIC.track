"""Unit tests for Work Phase Service."""
import datetime
from datetime import timezone
from unittest.mock import MagicMock, patch

from api.services.work_phase import WorkPhaseService
from api.models.event_template import EventPositionEnum
from api.models.event_type import EventTypeEnum
from api.models.event_category import EventCategoryEnum


class TestCreateBulkWorkPhases:
    """Tests for create_bulk_work_phases method."""

    @patch("api.services.work_phase.WorkPhase")
    @patch("api.services.work_phase.WorkPhaseSchema")
    def test_creates_multiple_work_phases(self, mock_schema, mock_model):
        """Test bulk creating work phases."""
        work_phases_data = [
            {"work_id": 1, "phase_id": 1},
            {"work_id": 1, "phase_id": 2},
        ]

        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.load.return_value = work_phases_data

        mock_instance1 = MagicMock()
        mock_instance2 = MagicMock()
        mock_model.side_effect = [mock_instance1, mock_instance2]

        WorkPhaseService.create_bulk_work_phases(work_phases_data)

        mock_schema_instance.load.assert_called_once_with(work_phases_data)
        assert mock_model.call_count == 2
        mock_instance1.flush.assert_called_once()
        mock_instance2.flush.assert_called_once()
        mock_model.commit.assert_called_once()


class TestFindByWorkId:
    """Tests for find_by_work_id method."""

    @patch("api.services.work_phase.db")
    def test_finds_active_work_phases_by_work_id(self, mock_db):
        """Test finding work phases for a work."""
        work_id = 10
        mock_phase1 = MagicMock(id=1, work_id=work_id)
        mock_phase2 = MagicMock(id=2, work_id=work_id)

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [mock_phase1, mock_phase2]

        result = WorkPhaseService.find_by_work_id(work_id)

        assert len(result) == 2
        assert result[0].id == 1
        assert result[1].id == 2


class TestFindByWorkAndPhase:
    """Tests for find_by_work_and_phase method."""

    @patch("api.services.work_phase.WorkPhaseService.find_work_phase_status")
    @patch("api.services.work_phase.WorkPhaseService.find_work_phases_by_work_ids")
    def test_finds_specific_work_phase_status(self, mock_find_phases, mock_find_status):
        """Test finding work phase status for specific work and phase."""
        work_id = 10
        phase_id = 5
        mock_event_service = MagicMock()

        mock_work_phases = {work_id: [MagicMock(id=1), MagicMock(id=2)]}
        mock_find_phases.return_value = (mock_work_phases, 2)

        mock_phase_status = {"work_phase": MagicMock(), "days_left": 30}
        mock_find_status.return_value = mock_phase_status

        result = WorkPhaseService.find_by_work_and_phase(work_id, phase_id, mock_event_service)

        assert result == mock_phase_status
        mock_find_phases.assert_called_once_with([work_id])
        mock_find_status.assert_called_once()


class TestGetTemplateUploadStatus:
    """Tests for get_template_upload_status method."""

    @patch("api.services.work_phase.TaskTemplateService")
    @patch("api.services.work_phase.WorkPhase")
    def test_returns_upload_status(self, mock_model, mock_task_service):
        """Test getting template upload status for work phase."""
        work_phase_id = 5

        mock_work = MagicMock(work_type_id=1, ea_act_id=2)
        mock_phase = MagicMock(id=work_phase_id, task_added=True, phase_id=3, work=mock_work)
        mock_model.find_by_id.return_value = mock_phase
        mock_task_service.check_template_exists.return_value = True

        result = WorkPhaseService.get_template_upload_status(work_phase_id)

        assert result["task_added"] is True
        assert result["template_available"] is True
        mock_task_service.check_template_exists.assert_called_once_with(
            work_type_id=1, phase_id=3, ea_act_id=2
        )


class TestFindCurrentWorkPhase:
    """Tests for find_current_work_phase method."""

    @patch("api.services.work_phase.db")
    def test_finds_current_incomplete_phase(self, mock_db):
        """Test finding the current work phase in progress."""
        work_id = 10

        mock_current_phase = MagicMock(id=5, is_completed=False)
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = mock_current_phase

        result = WorkPhaseService.find_current_work_phase(work_id)

        assert result == mock_current_phase


class TestFindWorkPhasesStatus:
    """Tests for find_work_phases_status method."""

    @patch("api.services.work_phase.WorkPhaseService.find_multiple_works_phases_status")
    def test_returns_work_phases_status(self, mock_find_multiple):
        """Test finding work phases status for single work."""
        work_id = 10
        mock_event_service = MagicMock()

        mock_phases_status = [{"work_phase": MagicMock(), "days_left": 30}]
        mock_find_multiple.return_value = {work_id: mock_phases_status}

        result = WorkPhaseService.find_work_phases_status(work_id, mock_event_service)

        assert result == mock_phases_status
        mock_find_multiple.assert_called_once()


class TestFindMultipleWorksPhasesStatus:
    """Tests for find_multiple_works_phases_status method."""

    @patch("api.services.work_phase.WorkPhaseService.find_work_phase_status")
    @patch("api.services.work_phase.WorkPhaseService.find_work_phases_by_work_ids")
    def test_finds_phases_for_multiple_works(self, mock_find_phases, mock_find_status):
        """Test finding work phases status for multiple works."""
        work_params = {1: None, 2: None}
        mock_event_service = MagicMock()

        mock_phases_dict = {
            1: [MagicMock(id=1), MagicMock(id=2)],
            2: [MagicMock(id=3)]
        }
        mock_find_phases.return_value = (mock_phases_dict, 3)

        mock_status1 = [{"work_phase": MagicMock(), "days_left": 30}]
        mock_status2 = [{"work_phase": MagicMock(), "days_left": 20}]
        mock_find_status.side_effect = [mock_status1, mock_status2]

        result = WorkPhaseService.find_multiple_works_phases_status(work_params, mock_event_service)

        assert 1 in result
        assert 2 in result
        assert result[1] == mock_status1
        assert result[2] == mock_status2


class TestFindWorkPhasesByWorkIds:
    """Tests for find_work_phases_by_work_ids method."""

    @patch("api.services.work_phase.db")
    def test_returns_phases_grouped_by_work(self, mock_db):
        """Test finding work phases grouped by work IDs."""
        work_ids = [1, 2]

        mock_results = [
            (1, MagicMock(id=10, is_active=True)),
            (1, MagicMock(id=11, is_active=True)),
            (2, MagicMock(id=12, is_active=True)),
        ]

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = mock_results

        result_dict, total = WorkPhaseService.find_work_phases_by_work_ids(work_ids)

        assert total == 3
        assert 1 in result_dict
        assert 2 in result_dict
        assert len(result_dict[1]) == 2
        assert len(result_dict[2]) == 1


class TestSaveNotes:
    """Tests for save_notes method."""

    @patch("api.services.work_phase.WorkPhase")
    def test_saves_responsibility_notes(self, mock_model):
        """Test saving notes to work phase."""
        work_phase_id = 5
        notes = "These are important notes"

        mock_phase = MagicMock(id=work_phase_id)
        mock_model.find_by_id.return_value = mock_phase

        result = WorkPhaseService.save_notes(work_phase_id, notes)

        assert mock_phase.responsibility_notes == notes
        mock_phase.save.assert_called_once()
        assert result == mock_phase


class TestFindWorkPhaseStatus:
    """Tests for find_work_phase_status method."""

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_days_taken")
    @patch("api.services.work_phase.WorkPhaseService._get_days_left")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_calculates_phase_status_with_milestones(
        self, mock_filter, mock_milestone_info, mock_days_left, mock_days_taken, mock_responsibility_service
    ):
        """Test calculating work phase status with events."""
        work_id = 10
        work_phase_id = None

        mock_work = MagicMock(current_work_phase_id=5)
        mock_phase = MagicMock(
            id=5,
            work=mock_work,
            number_of_days=100,
            start_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc),
            end_date=datetime.datetime(2024, 4, 10, tzinfo=timezone.utc),
        )
        work_phases = [mock_phase]

        mock_event_config = MagicMock(event_type_id=EventTypeEnum.TIME_LIMIT_EXTENSION.value)
        mock_extension_event = MagicMock(
            number_of_days=10,
            event_configuration=mock_event_config,
            actual_date=None
        )
        mock_events = [mock_extension_event]

        mock_event_service = MagicMock()
        mock_event_service.find_events.return_value = mock_events

        mock_filter.return_value = [mock_extension_event]
        mock_milestone_info.return_value = {
            "current_milestone": "Start",
            "next_milestone": "Decision",
            "decision": None
        }
        mock_days_left.return_value = 80
        mock_days_taken.return_value = 30
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        result = WorkPhaseService.find_work_phase_status(
            work_id, work_phase_id, work_phases, mock_event_service
        )

        assert len(result) == 1
        assert result[0]["work_phase"] == mock_phase
        assert result[0]["total_number_of_days"] == 110  # 100 + 10 extension
        assert "current_milestone" in result[0]
        assert "days_left" in result[0]
        assert "days_taken" in result[0]

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_days_taken")
    @patch("api.services.work_phase.WorkPhaseService._get_days_left")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_handles_suspended_events(
        self, mock_filter, mock_milestone_info, mock_days_left, mock_days_taken, mock_responsibility_service
    ):
        """Test phase status with suspended/resumed events."""
        work_id = 10

        mock_work = MagicMock(current_work_phase_id=5)
        mock_phase = MagicMock(
            id=5,
            work=mock_work,
            number_of_days=100,
            start_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc),
            end_date=datetime.datetime(2024, 4, 10, tzinfo=timezone.utc),
        )
        work_phases = [mock_phase]

        mock_suspend_config = MagicMock(event_type_id=EventTypeEnum.TIME_LIMIT_RESUMPTION.value)
        mock_suspend_event = MagicMock(
            number_of_days=15,
            event_configuration=mock_suspend_config,
            actual_date=datetime.datetime(2024, 2, 1, tzinfo=timezone.utc)
        )

        mock_event_service = MagicMock()
        mock_event_service.find_events.return_value = [mock_suspend_event]

        mock_filter.return_value = [mock_suspend_event]
        mock_milestone_info.return_value = {}
        mock_days_left.return_value = 70
        mock_days_taken.return_value = 15
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        result = WorkPhaseService.find_work_phase_status(
            work_id, None, work_phases, mock_event_service
        )

        assert result[0]["total_number_of_days"] == 85  # 100 - 15 suspended


class TestGetMilestoneInformation:
    """Tests for _get_milestone_information private method."""

    def test_returns_current_and_next_milestones(self):
        """Test extracting milestone information from events."""
        mock_completed_event = MagicMock()
        mock_completed_event.name = "Project Start"
        mock_completed_event.actual_date = datetime.datetime(2024, 1, 1, tzinfo=timezone.utc)
        mock_completed_event.anticipated_date = datetime.datetime(2024, 1, 1, tzinfo=timezone.utc)
        mock_completed_event.event_position = EventPositionEnum.START.value

        mock_event_config = MagicMock(event_category_id=EventCategoryEnum.MILESTONE.value)
        mock_pending_event = MagicMock()
        mock_pending_event.name = "Public Comment Period"
        mock_pending_event.actual_date = None
        mock_pending_event.anticipated_date = datetime.datetime(2024, 2, 1, tzinfo=timezone.utc)
        mock_pending_event.event_configuration = mock_event_config
        mock_pending_event.event_position = EventPositionEnum.INTERMEDIATE.value

        events = [mock_completed_event, mock_pending_event]

        result = WorkPhaseService._get_milestone_information(events)

        assert result["current_milestone"] == "Project Start"
        assert result["next_milestone"] == "Public Comment Period"
        assert result["next_milestone_date"] == datetime.datetime(2024, 2, 1, tzinfo=timezone.utc)

    def test_returns_decision_milestone_when_present(self):
        """Test extracting decision milestone information."""
        mock_outcome = MagicMock()
        mock_outcome.name = "Approved"
        mock_decision_config = MagicMock(event_category_id=EventCategoryEnum.DECISION.value)
        mock_decision_event = MagicMock()
        mock_decision_event.name = "Minister Decision"
        mock_decision_event.actual_date = datetime.datetime(2024, 3, 1, tzinfo=timezone.utc)
        mock_decision_event.event_configuration = mock_decision_config
        mock_decision_event.outcome = mock_outcome
        mock_decision_event.event_position = EventPositionEnum.END.value

        events = [mock_decision_event]

        result = WorkPhaseService._get_milestone_information(events)

        assert result["decision_milestone"] == "Minister Decision"
        assert result["decision"] == "Approved"
        assert result["decision_milestone_date"] == datetime.datetime(2024, 3, 1, tzinfo=timezone.utc)

    def test_handles_no_completed_milestones(self):
        """Test when no milestones are completed."""
        mock_event_config = MagicMock(event_category_id=EventCategoryEnum.MILESTONE.value)
        mock_pending_event = MagicMock()
        mock_pending_event.name = "Future Milestone"
        mock_pending_event.actual_date = None
        mock_pending_event.anticipated_date = datetime.datetime(2024, 5, 1, tzinfo=timezone.utc)
        mock_pending_event.event_configuration = mock_event_config
        mock_pending_event.event_position = EventPositionEnum.START.value

        events = [mock_pending_event]

        result = WorkPhaseService._get_milestone_information(events)

        assert result["current_milestone"] is None
        assert result["next_milestone"] == "Future Milestone"


class TestCalculateMilestoneProgress:
    """Tests for _calculate_milestone_progress private method."""

    def test_calculates_progress_percentage(self):
        """Test calculating milestone completion percentage."""
        mock_phase_config = MagicMock()
        mock_phase_config.work_phase.is_completed = True

        mock_config = MagicMock(work_phase=mock_phase_config)
        events = [
            MagicMock(actual_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc), event_configuration=mock_config),
            MagicMock(actual_date=datetime.datetime(2024, 2, 1, tzinfo=timezone.utc), event_configuration=mock_config),
            MagicMock(actual_date=None, event_configuration=mock_config),
            MagicMock(actual_date=None, event_configuration=mock_config),
        ]

        result = WorkPhaseService._calculate_milestone_progress(events)

        assert result == 50.0  # 2 out of 4 completed

    def test_caps_progress_at_90_when_phase_incomplete(self):
        """Test progress capped at 90% when all milestones done but phase not marked complete."""
        # Create events where all have actual_date (100% complete)
        # but work_phase.is_completed is False
        mock_phase = MagicMock()
        mock_phase.is_completed = False
        mock_config = MagicMock()
        mock_config.work_phase = mock_phase

        events = [
            MagicMock(actual_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc), event_configuration=mock_config),
            MagicMock(actual_date=datetime.datetime(2024, 2, 1, tzinfo=timezone.utc), event_configuration=mock_config),
        ]

        result = WorkPhaseService._calculate_milestone_progress(events)

        assert result == 90  # Capped at 90 because phase not complete


class TestFilterSortEvents:
    """Tests for _filter_sort_events private method."""

    @patch("api.services.work_phase.event_compare_func")
    @patch("api.services.work_phase.functools.cmp_to_key")
    def test_filters_events_by_work_phase(self, mock_cmp_to_key, mock_compare_func):
        """Test filtering events for specific work phase."""
        mock_config1 = MagicMock(work_phase_id=5)
        mock_config2 = MagicMock(work_phase_id=10)

        event1 = MagicMock(event_configuration=mock_config1)
        event2 = MagicMock(event_configuration=mock_config2)
        event3 = MagicMock(event_configuration=mock_config1)

        events = [event1, event2, event3]
        work_phase = MagicMock(id=5)

        mock_cmp_to_key.return_value = lambda x: x.event_configuration.work_phase_id

        result = WorkPhaseService._filter_sort_events(events, work_phase)

        assert len(result) == 2
        assert event2 not in result


class TestGetDaysLeft:
    """Tests for _get_days_left private method."""

    @patch("api.services.work_phase.WorkPhaseService._get_days_taken")
    def test_calculates_days_left_for_current_phase(self, mock_days_taken):
        """Test calculating days left for current incomplete phase."""
        mock_work = MagicMock(current_work_phase_id=5)
        work_phase = MagicMock(id=5, work=mock_work, is_completed=False)
        total_days = 100
        suspended_days = 10
        events = []

        mock_days_taken.return_value = 30

        result = WorkPhaseService._get_days_left(suspended_days, total_days, work_phase, events)

        # (100 - 10) - 30 = 60
        assert result == 60

    def test_returns_total_minus_suspended_for_completed_phase(self):
        """Test returns total days minus suspended for non-current phase."""
        mock_work = MagicMock(current_work_phase_id=10)
        work_phase = MagicMock(id=5, work=mock_work, is_completed=True)
        total_days = 100
        suspended_days = 10
        events = []

        result = WorkPhaseService._get_days_left(suspended_days, total_days, work_phase, events)

        assert result == 90  # 100 - 10


class TestGetDaysTaken:
    """Tests for _get_days_taken private method."""

    def test_calculates_days_for_current_active_phase(self):
        """Test calculating days taken for current active phase."""
        now = datetime.datetime(2024, 2, 1, tzinfo=timezone.utc)
        start = datetime.datetime(2024, 1, 1, tzinfo=timezone.utc)

        with patch("api.services.work_phase.datetime") as mock_datetime_module:
            # Create a mock for the now() return value with working .date()
            mock_now = MagicMock()
            mock_now.date.return_value = now.date()
            mock_datetime_module.datetime.now.return_value = mock_now

            mock_work = MagicMock(current_work_phase_id=5)
            work_phase = MagicMock(
                id=5,
                work=mock_work,
                is_completed=False,
                is_suspended=False,
            )
            # Set start_date explicitly so .date() method works
            work_phase.start_date = start

            # Add an incomplete event to ensure all_events_completed = False
            mock_event = MagicMock(actual_date=None)
            events = [mock_event]

            result = WorkPhaseService._get_days_taken(work_phase, events, suspended_days=0)

            assert result == 31  # Days from Jan 1 to Feb 1

    def test_calculates_days_for_completed_phase(self):
        """Test calculating days taken for completed phase."""
        # Create proper mock objects with name attribute
        mock_start_position = MagicMock()
        mock_start_position.name = "START"
        mock_end_position = MagicMock()
        mock_end_position.name = "END"

        mock_start_config = MagicMock()
        mock_start_config.event_position = mock_start_position
        mock_end_config = MagicMock()
        mock_end_config.event_position = mock_end_position

        start_event = MagicMock(
            actual_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc),
            event_configuration=mock_start_config
        )
        end_event = MagicMock(
            actual_date=datetime.datetime(2024, 3, 1, tzinfo=timezone.utc),
            event_configuration=mock_end_config
        )

        mock_work = MagicMock(current_work_phase_id=5)
        work_phase = MagicMock(id=5, work=mock_work, is_completed=True)
        events = [start_event, end_event]

        result = WorkPhaseService._get_days_taken(work_phase, events, suspended_days=0)

        assert result == 60  # Days from Jan 1 to Mar 1

    def test_subtracts_suspended_days(self):
        """Test days taken subtracts suspended days."""
        # Create proper mock objects with name attribute
        mock_start_position = MagicMock()
        mock_start_position.name = "START"
        mock_end_position = MagicMock()
        mock_end_position.name = "END"

        mock_start_config = MagicMock()
        mock_start_config.event_position = mock_start_position
        mock_end_config = MagicMock()
        mock_end_config.event_position = mock_end_position

        start_event = MagicMock(
            actual_date=datetime.datetime(2024, 1, 1, tzinfo=timezone.utc),
            event_configuration=mock_start_config
        )
        end_event = MagicMock(
            actual_date=datetime.datetime(2024, 3, 1, tzinfo=timezone.utc),
            event_configuration=mock_end_config
        )

        mock_work = MagicMock(current_work_phase_id=5)
        work_phase = MagicMock(id=5, work=mock_work, is_completed=True)
        events = [start_event, end_event]

        result = WorkPhaseService._get_days_taken(work_phase, events, suspended_days=10)

        assert result == 50  # 60 - 10
