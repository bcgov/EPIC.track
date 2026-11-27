"""Unit tests for Work Phase Service."""
import datetime
from datetime import timezone
from unittest.mock import MagicMock, patch

from api.services.work_phase import WorkPhaseService
from api.models.event_template import EventPositionEnum
from api.models.event_category import EventCategoryEnum


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


def _milestone(position=EventPositionEnum.INTERMEDIATE, role=None, actual_date=None, number_of_days=0):
    """A phase event as the day counts read it."""
    event = MagicMock(actual_date=actual_date, number_of_days=number_of_days)
    event.event_configuration.event_position = position
    event.event_configuration.role = role
    return event


def _current_phase(number_of_days, started_days_ago):
    start_date = datetime.datetime.now(timezone.utc) - datetime.timedelta(days=started_days_ago)
    return MagicMock(
        id=5, work=MagicMock(current_work_phase_id=5), number_of_days=number_of_days, is_completed=False,
        is_suspended=False, start_date=start_date, end_date=start_date + datetime.timedelta(days=number_of_days),
    )


class TestFindWorkPhaseStatus:
    """Tests for find_work_phase_status method."""

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_counts_only_dated_extensions(self, mock_filter, mock_milestone_info, mock_responsibility_service):
        """A granted extension adds to the time allowed, and a planned one doesn't yet."""
        phase = _current_phase(100, started_days_ago=30)
        mock_filter.return_value = [
            _milestone(EventPositionEnum.START, actual_date=phase.start_date),
            _milestone(role="TIME_LIMIT_EXTENSION", actual_date=phase.start_date, number_of_days=10),
            _milestone(role="TIME_LIMIT_EXTENSION", number_of_days=20),
            _milestone(EventPositionEnum.END),
        ]
        mock_milestone_info.return_value = {"current_milestone": "Start"}
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        [result] = WorkPhaseService.find_work_phase_status(10, None, [phase], MagicMock())

        assert (result["total_number_of_days"], result["days_taken"], result["days_left"]) == (110, 30, 80)
        assert result["current_milestone"] == "Start"

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_suspended_days_are_not_overage(self, mock_filter, mock_milestone_info, mock_responsibility_service):
        """A 10-day phase 25 days in, with 15 of them suspended, has taken its 10 days and isn't over."""
        phase = _current_phase(10, started_days_ago=25)
        mock_filter.return_value = [
            _milestone(EventPositionEnum.START, actual_date=phase.start_date),
            _milestone(role="TIME_LIMIT_RESUMPTION", actual_date=phase.start_date + datetime.timedelta(days=18),
                       number_of_days=15),
            _milestone(EventPositionEnum.END),
        ]
        mock_milestone_info.return_value = {}
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        [result] = WorkPhaseService.find_work_phase_status(10, None, [phase], MagicMock())

        assert (result["total_number_of_days"], result["days_taken"], result["days_left"]) == (10, 10, 0)

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_a_completed_phase_counts_from_its_start_to_its_end(
        self, mock_filter, mock_milestone_info, mock_responsibility_service
    ):
        """A completed phase is counted between its START and END actual dates, and keeps its time as time left."""
        phase = _current_phase(100, started_days_ago=90)
        phase.is_completed = True
        mock_filter.return_value = [
            _milestone(EventPositionEnum.START, actual_date=phase.start_date),
            _milestone(EventPositionEnum.END, actual_date=phase.start_date + datetime.timedelta(days=60)),
        ]
        mock_milestone_info.return_value = {}
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        [result] = WorkPhaseService.find_work_phase_status(10, None, [phase], MagicMock())

        assert (result["total_number_of_days"], result["days_taken"], result["days_left"]) == (100, 60, 100)

    @patch("api.services.work_phase.PhaseOverageResponsibilityService")
    @patch("api.services.work_phase.WorkPhaseService._get_milestone_information")
    @patch("api.services.work_phase.WorkPhaseService._filter_sort_events")
    def test_a_phase_without_milestones_has_its_time_left(
        self, mock_filter, mock_milestone_info, mock_responsibility_service
    ):
        """A phase with no primary-category events counts no days taken."""
        mock_filter.return_value = []
        mock_milestone_info.return_value = {}
        mock_responsibility_service.find_by_work_phase_id.return_value = []

        [result] = WorkPhaseService.find_work_phase_status(10, None, [_current_phase(30, 5)], MagicMock())

        assert (result["total_number_of_days"], result["days_taken"], result["days_left"]) == (30, 0, 30)


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


def _decision_event(event_id, work_phase_id, actual_date, outcome_name=None):
    """Build a decision milestone event in the given work phase."""
    anticipated_date = actual_date or datetime.datetime(2024, 6, 1, tzinfo=timezone.utc)
    event = MagicMock(id=event_id, actual_date=actual_date, anticipated_date=anticipated_date)
    event.event_configuration = MagicMock(
        work_phase_id=work_phase_id, event_category_id=EventCategoryEnum.DECISION.value
    )
    if outcome_name is None:
        event.outcome = None
    else:
        event.outcome = MagicMock()
        event.outcome.name = outcome_name
    return event


class TestFindLatestDecisions:
    """Tests for find_latest_decisions method."""

    @patch.object(WorkPhaseService, "find_work_phases_by_work_ids")
    def test_returns_the_decision_with_the_latest_date(self, mock_find_phases):
        """The phase decision decided last wins, whatever the phase order."""
        mock_find_phases.return_value = ({1: [MagicMock(id=10), MagicMock(id=11)]}, 2)
        mock_event_service = MagicMock()
        mock_event_service.find_events.return_value = [
            _decision_event(100, 10, datetime.datetime(2024, 5, 1, tzinfo=timezone.utc), "Amendment Granted"),
            _decision_event(101, 11, datetime.datetime(2024, 3, 1, tzinfo=timezone.utc), "Referred"),
        ]

        result = WorkPhaseService.find_latest_decisions([1], mock_event_service)

        assert result == {1: "Amendment Granted"}
        mock_event_service.find_events.assert_called_once_with(
            1, event_categories=[EventCategoryEnum.DECISION]
        )

    @patch.object(WorkPhaseService, "find_work_phases_by_work_ids")
    def test_a_phase_whose_last_decision_has_no_outcome_is_skipped(self, mock_find_phases):
        """A phase's decision is its last completed decision milestone, as in its phase status."""
        mock_find_phases.return_value = ({1: [MagicMock(id=10), MagicMock(id=11)]}, 2)
        mock_event_service = MagicMock()
        mock_event_service.find_events.return_value = [
            _decision_event(100, 10, datetime.datetime(2024, 1, 1, tzinfo=timezone.utc), "Referred"),
            _decision_event(101, 11, datetime.datetime(2024, 2, 1, tzinfo=timezone.utc), "Approved"),
            _decision_event(102, 11, datetime.datetime(2024, 3, 1, tzinfo=timezone.utc)),
        ]

        result = WorkPhaseService.find_latest_decisions([1], mock_event_service)

        assert result == {1: "Referred"}

    @patch.object(WorkPhaseService, "find_work_phases_by_work_ids")
    def test_a_work_without_a_completed_decision_has_none(self, mock_find_phases):
        """An upcoming decision milestone is not a decision, nor is a work with no phases."""
        mock_find_phases.return_value = ({1: [MagicMock(id=10)]}, 1)
        mock_event_service = MagicMock()
        mock_event_service.find_events.side_effect = [
            [_decision_event(100, 10, None, "Approved")],
            [],
        ]

        result = WorkPhaseService.find_latest_decisions([1, 2], mock_event_service)

        assert result == {1: None, 2: None}


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
