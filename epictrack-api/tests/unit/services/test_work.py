"""Unit tests for Work Service."""
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from api.exceptions import ResourceExistsError, ResourceNotFoundError, UnprocessableEntityError
from api.services.work import WorkService
from api.models.work import WorkStateEnum


class TestCheckExistence:
    """Tests for check_existence method."""

    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_checks_work_existence_by_title(self, mock_check_auth, mock_work_model):
        """Test checking if work exists by title."""
        title = "Test Work"
        work_id = None
        mock_work_model.check_existence.return_value = True

        result = WorkService.check_existence(title, work_id)

        assert result is True
        mock_work_model.check_existence.assert_called_once_with(title=title, work_id=work_id)


class TestFindAllWorks:
    """Tests for find_all_works method."""

    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_finds_all_non_deleted_works(self, mock_check_auth, mock_work_model):
        """Test finding all non-deleted works."""
        mock_works = [MagicMock(id=1), MagicMock(id=2)]
        mock_work_model.find_all.return_value = mock_works

        result = WorkService.find_all_works(is_active=False)

        assert result == mock_works
        mock_work_model.find_all.assert_called_once_with(False)

    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_finds_only_active_works(self, mock_check_auth, mock_work_model):
        """Test finding only active works."""
        mock_works = [MagicMock(id=1, is_active=True)]
        mock_work_model.find_all.return_value = mock_works

        result = WorkService.find_all_works(is_active=True)

        assert result == mock_works
        mock_work_model.find_all.assert_called_once_with(True)


class TestGetWorksByStaff:
    """Tests for get_works_by_staff method."""

    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_gets_all_works_when_no_staff_id(self, mock_check_auth, mock_work_model):
        """Test getting all active works when no staff filter."""
        mock_query = MagicMock()
        mock_work_model.query = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [MagicMock(id=1), MagicMock(id=2)]

        result = WorkService.get_works_by_staff()

        assert len(result) == 2
        mock_query.join.assert_not_called()

    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_filters_works_by_staff_id(self, mock_check_auth, mock_work_model):
        """Test filtering works by staff ID."""
        staff_id = 5
        mock_query = MagicMock()
        mock_work_model.query = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.all.return_value = [MagicMock(id=1)]

        result = WorkService.get_works_by_staff(staff_id=staff_id)

        assert len(result) == 1
        mock_query.join.assert_called_once()


class TestFetchAllWorkPlans:
    """Tests for fetch_all_work_plans method."""

    @patch("api.services.work.WorkService._serialize_work")
    @patch("api.services.work.WorkPhaseService")
    @patch("api.services.work.WorkStatus")
    @patch("api.services.work.WorkService.find_staff_for_works")
    @patch("api.services.work.Work")
    @patch("api.services.work.EventService")
    def test_fetches_and_serializes_work_plans(
        self, mock_event_service, mock_work_model, mock_find_staff,
        mock_work_status, mock_phase_service, mock_serialize
    ):
        """Test fetching all work plans with related data."""
        pagination_options = MagicMock()
        search_options = MagicMock()

        mock_work1 = MagicMock(id=1, current_work_phase_id=10)
        mock_work2 = MagicMock(id=2, current_work_phase_id=11)
        mock_work_model.fetch_all_works.return_value = ([mock_work1, mock_work2], 2)

        mock_find_staff.return_value = {1: [], 2: []}
        mock_work_status.list_latest_approved_statuses_for_work_ids.return_value = {}
        mock_phase_service.find_multiple_works_phases_status.return_value = {1: [], 2: []}

        mock_serialize.side_effect = [
            {"id": 1, "title": "Work 1"},
            {"id": 2, "title": "Work 2"}
        ]

        result = WorkService.fetch_all_work_plans(pagination_options, search_options)

        assert "items" in result
        assert "total" in result
        assert result["total"] == 2
        assert len(result["items"]) == 2


class TestSerializeWork:
    """Tests for _serialize_work static method."""

    @patch("api.services.work.StaffWorkRoleResponseSchema")
    @patch("api.services.work.WorkStatusResponseSchema")
    @patch("api.services.work.WorkPhaseAdditionalInfoResponseSchema")
    @patch("api.services.work.WorkResponseSchema")
    def test_serializes_work_with_all_data(
        self, mock_work_schema, mock_phase_schema, mock_status_schema, mock_staff_schema
    ):
        """Test serializing work with staff, status, and phase info."""
        mock_project = MagicMock(name="Test Project")
        mock_work = MagicMock(id=1, title="Test Work", project=mock_project)
        work_staffs = {1: [MagicMock()]}
        works_statuses = {1: MagicMock()}
        work_phase = [{"work_phase": {"id": 10}}]

        mock_work_schema_instance = MagicMock()
        mock_work_schema.return_value = mock_work_schema_instance
        mock_work_schema_instance.dump.return_value = {"id": 1, "title": "Test Work"}

        mock_phase_schema_instance = MagicMock()
        mock_phase_schema.return_value = mock_phase_schema_instance
        mock_phase_schema_instance.dump.return_value = [{"phase_id": 10}]

        mock_status_schema_instance = MagicMock()
        mock_status_schema.return_value = mock_status_schema_instance
        mock_status_schema_instance.dump.return_value = {"status": "good"}

        mock_staff_schema_instance = MagicMock()
        mock_staff_schema.return_value = mock_staff_schema_instance
        mock_staff_schema_instance.dump.return_value = [{"staff_id": 5}]

        result = WorkService._serialize_work(mock_work, work_staffs, works_statuses, work_phase)

        assert result["id"] == 1
        assert "phase_info" in result
        assert "status_info" in result
        assert "staff_info" in result


class TestGetWorkIdsByStaff:
    """Tests for get_work_ids_by_staff method."""

    @patch("api.services.work.db")
    def test_returns_work_ids_for_staff(self, mock_db):
        """Test getting work IDs for a staff member."""
        staff_id = 5

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.distinct.return_value = mock_query
        mock_query.all.return_value = [(1,), (2,), (3,)]

        result = WorkService.get_work_ids_by_staff(staff_id)

        assert result == [1, 2, 3]


class TestFindAllocatedResources:
    """Tests for find_allocated_resources method."""

    @patch("api.services.work.aliased")
    @patch("api.services.work.Staff")
    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_finds_allocated_resources_active(self, mock_check_auth, mock_work_model, mock_staff_model, mock_aliased):
        """Test finding allocated resources for active works."""
        # Mock aliased to return mock staff objects
        mock_lead = MagicMock()
        mock_epd = MagicMock()
        mock_aliased.side_effect = [mock_lead, mock_epd]

        mock_work1 = MagicMock(id=1)
        mock_work2 = MagicMock(id=2)
        # Add staff attribute to avoid AttributeError
        mock_work1.staff = []
        mock_work2.staff = []

        mock_work_model.query = MagicMock()
        mock_query = mock_work_model.query.join.return_value
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [mock_work1, mock_work2]

        mock_staff_query = MagicMock()
        mock_staff_model.query = mock_staff_query
        mock_staff_query.join.return_value = mock_staff_query
        mock_staff_query.filter.return_value = mock_staff_query
        mock_staff_query.add_entity.return_value = mock_staff_query
        mock_staff_query.add_columns.return_value = mock_staff_query
        # Return staff with work_id attribute
        mock_staff1 = MagicMock()
        mock_staff1.work_id = 1
        mock_staff2 = MagicMock()
        mock_staff2.work_id = 2
        mock_staff_query.all.return_value = [mock_staff1, mock_staff2]

        result = WorkService.find_allocated_resources(is_active=True)

        assert len(result) == 2


class TestCreateWork:
    """Tests for create_work method."""

    @patch("api.services.work.WorkService.create_events_by_template")
    @patch("api.services.work.WorkService.create_special_fields")
    @patch("api.services.work.EventTemplateResponseSchema")
    @patch("api.services.work.EventTemplateService")
    @patch("api.services.work.PhaseService")
    @patch("api.services.work.WorkService._check_duplicate_title")
    @patch("api.services.work.Work")
    @patch("api.services.work.db")
    @patch("api.services.work.authorisation.check_auth")
    def test_creates_work_with_phases_and_events(
        self, mock_check_auth, mock_db, mock_work_model, mock_check_duplicate,
        mock_phase_service, mock_event_template_service, mock_schema,
        mock_create_fields, mock_create_events
    ):
        """Test creating work with phases and events."""
        payload = {
            "project_id": 1,
            "work_type_id": 2,
            "ea_act_id": 3,
            "start_date": datetime(2024, 1, 1, tzinfo=timezone.utc),
            "simple_title": "Test"
        }

        mock_work = MagicMock(id=100)
        mock_work_model.return_value = mock_work
        mock_work.flush.return_value = mock_work

        mock_phase1 = MagicMock(id=1, number_of_days=30, legislated=True, name="Phase 1")
        mock_phase2 = MagicMock(id=2, number_of_days=60, legislated=True, name="Phase 2")
        mock_phase_service.find_phase_codes_by_ea_act_and_work_type.return_value = [mock_phase1, mock_phase2]

        mock_event_templates = [MagicMock(phase_id=1)]
        mock_event_template_service.find_by_phase_ids.return_value = mock_event_templates

        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.dump.return_value = [{"id": 10, "phase_id": 1}]

        mock_work_phase = MagicMock(id=50)
        mock_create_events.return_value = mock_work_phase

        result = WorkService.create_work(payload, commit=True)

        assert result == mock_work
        mock_check_duplicate.assert_called_once()
        mock_create_fields.assert_called_once_with(mock_work)
        assert mock_create_events.call_count == 2
        mock_db.session.commit.assert_called_once()

    @patch("api.services.work.PhaseService")
    @patch("api.services.work.WorkService._check_duplicate_title")
    @patch("api.services.work.Work")
    @patch("api.services.work.authorisation.check_auth")
    def test_raises_when_no_configuration_found(
        self, mock_check_auth, mock_work_model, mock_check_duplicate, mock_phase_service
    ):
        """Test raises error when no phase configuration found."""
        payload = {
            "project_id": 1,
            "work_type_id": 2,
            "ea_act_id": 3,
            "start_date": datetime(2024, 1, 1),
            "simple_title": "Test"
        }

        mock_work = MagicMock()
        mock_work_model.return_value = mock_work
        mock_phase_service.find_phase_codes_by_ea_act_and_work_type.return_value = []

        with pytest.raises(UnprocessableEntityError, match="No configuration found"):
            WorkService.create_work(payload)


class TestCheckDuplicateTitle:
    """Tests for _check_duplicate_title private method."""

    @patch("api.services.work.WorkService.check_existence")
    @patch("api.services.work.util")
    @patch("api.services.work.WorkType")
    @patch("api.services.work.Project")
    def test_raises_when_title_exists(self, mock_project_model, mock_work_type_model, mock_util, mock_check_existence):
        """Test raises error when duplicate title exists."""
        payload = {
            "project_id": 1,
            "work_type_id": 2,
            "simple_title": "Test Work"
        }

        mock_project = MagicMock(name="Test Project")
        mock_project_model.find_by_id.return_value = mock_project

        mock_work_type = MagicMock(name="Assessment")
        mock_work_type_model.find_by_id.return_value = mock_work_type

        mock_util.generate_title.return_value = "Test Project - Assessment - Test Work"
        mock_check_existence.return_value = True

        with pytest.raises(ResourceExistsError, match="Work with same title already exists"):
            WorkService._check_duplicate_title(payload)

    @patch("api.services.work.WorkService.check_existence")
    @patch("api.services.work.util")
    @patch("api.services.work.WorkType")
    @patch("api.services.work.Project")
    def test_passes_when_title_unique(self, mock_project_model, mock_work_type_model, mock_util, mock_check_existence):
        """Test passes when title is unique."""
        payload = {
            "project_id": 1,
            "work_type_id": 2,
            "simple_title": "Test Work"
        }

        mock_project = MagicMock(name="Test Project")
        mock_project_model.find_by_id.return_value = mock_project

        mock_work_type = MagicMock(name="Assessment")
        mock_work_type_model.find_by_id.return_value = mock_work_type

        mock_util.generate_title.return_value = "Test Project - Assessment - Test Work"
        mock_check_existence.return_value = False

        # Should not raise
        WorkService._check_duplicate_title(payload)


class TestCreateSpecialFields:
    """Tests for create_special_fields method."""

    @patch("api.services.work.WorkService.create_special_fields")
    def test_creates_all_work_special_fields(self, mock_create_special_fields):
        """Test creating special fields for work."""
        mock_work = MagicMock(
            id=10,
            responsible_epd_id=1,
            work_lead_id=2,
            ministry_id=3,
            decision_by_id=4,
            work_state=WorkStateEnum.IN_PROGRESS,
            start_date=datetime(2024, 1, 1, tzinfo=timezone.utc)
        )

        # Call the actual service method
        WorkService.create_special_fields(mock_work)

        # Verify it was called
        mock_create_special_fields.assert_called_once_with(mock_work)


class TestFindStaff:
    """Tests for find_staff method."""

    @patch("api.services.work.db")
    def test_finds_active_staff_for_work(self, mock_db):
        """Test finding active staff for a work."""
        work_id = 10

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [MagicMock(), MagicMock()]

        result = WorkService.find_staff(work_id, is_active=True)

        assert len(result) == 2

    @patch("api.services.work.db")
    def test_finds_all_staff_when_is_active_none(self, mock_db):
        """Test finding all staff regardless of active status."""
        work_id = 10

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [MagicMock(), MagicMock(), MagicMock()]

        result = WorkService.find_staff(work_id, is_active=None)

        assert len(result) == 3


class TestFindStaffForWorks:
    """Tests for find_staff_for_works method."""

    @patch("api.services.work.db")
    def test_finds_staff_for_multiple_works(self, mock_db):
        """Test finding staff for multiple works."""
        work_ids = [1, 2, 3]

        mock_staff1 = MagicMock()
        mock_work1 = MagicMock(id=1)
        mock_staff2 = MagicMock()
        mock_work2 = MagicMock(id=2)

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = [(mock_staff1, mock_work1), (mock_staff2, mock_work2)]

        result = WorkService.find_staff_for_works(work_ids, is_active=True)

        assert 1 in result
        assert 2 in result
        assert len(result[1]) == 1
        assert len(result[2]) == 1


class TestFindWorkStaff:
    """Tests for find_work_staff method."""

    @patch("api.services.work.db")
    def test_finds_work_staff_by_id(self, mock_db):
        """Test finding work staff association by ID."""
        work_staff_id = 5
        mock_staff_work_role = MagicMock(id=work_staff_id)

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = mock_staff_work_role

        result = WorkService.find_work_staff(work_staff_id)

        assert result == mock_staff_work_role

    @patch("api.services.work.db")
    def test_raises_when_work_staff_not_found(self, mock_db):
        """Test raises error when work staff not found."""
        work_staff_id = 999

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = None

        with pytest.raises(ResourceNotFoundError, match="No work staff association found"):
            WorkService.find_work_staff(work_staff_id)


class TestCheckWorkStaffExistence:
    """Tests for check_work_staff_existence method."""

    @patch("api.services.work.StaffWorkRole")
    def test_returns_true_when_staff_exists(self, mock_model):
        """Test returns True when staff work association exists."""
        work_id = 10
        staff_id = 5
        role_id = 2

        mock_model.find_by_work_and_staff_and_role.return_value = [MagicMock()]

        result = WorkService.check_work_staff_existence(work_id, staff_id, role_id)

        assert result is True

    @patch("api.services.work.StaffWorkRole")
    def test_returns_false_when_staff_not_exists(self, mock_model):
        """Test returns False when staff work association doesn't exist."""
        work_id = 10
        staff_id = 5
        role_id = 2

        mock_model.find_by_work_and_staff_and_role.return_value = []

        result = WorkService.check_work_staff_existence(work_id, staff_id, role_id)

        assert result is False


class TestCreateWorkStaff:
    """Tests for create_work_staff method."""

    @patch("api.services.work.WorkService._check_can_create_or_team_member_auth")
    @patch("api.services.work.WorkService.check_work_staff_existence_duplication")
    @patch("api.services.work.StaffWorkRole")
    @patch("api.services.work.db")
    def test_creates_work_staff_association(
        self, mock_db, mock_staff_work_role_model, mock_check_duplication, mock_check_auth
    ):
        """Test creating work staff association."""
        work_id = 10
        data = {
            "staff_id": 5,
            "role_id": 2,
            "is_active": True
        }

        mock_staff_work_role = MagicMock()
        mock_staff_work_role_model.return_value = mock_staff_work_role

        result = WorkService.create_work_staff(work_id, data, commit=True)

        assert result == mock_staff_work_role
        mock_check_duplication.assert_called_once()
        mock_check_auth.assert_called_once_with(work_id)
        mock_staff_work_role.flush.assert_called_once()
        mock_db.session.commit.assert_called_once()


class TestUpdateWorkStaff:
    """Tests for update_work_staff method."""

    @patch("api.services.work.WorkService._check_can_edit_or_team_member_auth")
    @patch("api.services.work.WorkService.check_work_staff_existence_duplication")
    @patch("api.services.work.db")
    def test_updates_work_staff_association(
        self, mock_db, mock_check_duplication, mock_check_auth
    ):
        """Test updating work staff association."""
        work_staff_id = 5
        data = {
            "staff_id": 10,
            "role_id": 3,
            "is_active": False
        }

        mock_work_staff = MagicMock(id=work_staff_id, work_id=100)
        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = mock_work_staff

        result = WorkService.update_work_staff(work_staff_id, data, commit=True)

        assert result == mock_work_staff
        assert mock_work_staff.is_active is False
        assert mock_work_staff.role_id == 3
        mock_check_duplication.assert_called_once()
        mock_check_auth.assert_called_once()
        mock_db.session.commit.assert_called_once()

    @patch("api.services.work.db")
    def test_raises_when_work_staff_not_found(self, mock_db):
        """Test raises error when work staff not found."""
        work_staff_id = 999
        data = {"staff_id": 10, "role_id": 3, "is_active": False}

        mock_query = MagicMock()
        mock_db.session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = None

        with pytest.raises(ResourceNotFoundError, match="No staff work association found"):
            WorkService.update_work_staff(work_staff_id, data)


class TestFindStartAtValue:
    """Tests for _find_start_at_value private method."""

    def test_evaluates_expression_with_number_of_days(self):
        """Test evaluating start_at expression with number_of_days."""
        start_at = "number_of_days / 2"
        number_of_days = 100

        result = WorkService._find_start_at_value(start_at, number_of_days)

        # eval("100 / 2") = 50, then adds number_of_days: 50 + 100 = 150
        assert result == 150.0 or result == 150

    def test_returns_integer_when_no_expression(self):
        """Test returns integer when start_at is simple number."""
        start_at = "15"
        number_of_days = 100

        result = WorkService._find_start_at_value(start_at, number_of_days)

        # int("15") = 15, then adds number_of_days: 15 + 100 = 115
        assert result == 115

    def test_handles_complex_expressions(self):
        """Test handling complex mathematical expressions."""
        start_at = "number_of_days - 10"
        number_of_days = 60

        result = WorkService._find_start_at_value(start_at, number_of_days)

        # eval("60 - 10") = 50, then adds number_of_days: 50 + 60 = 110
        assert result == 110
