"""Unit tests for Work Issues Service."""
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from api.exceptions import BadRequestError, ResourceNotFoundError
from api.services.work_issues import WorkIssuesService
from api.utils.enums import StalenessEnum


class TestFindAllWorkIssues:
    """Tests for find_all_work_issues method."""

    @patch("api.services.work_issues.WorkIssuesModel")
    def test_finds_all_issues_for_work(self, mock_model):
        """Test finding all issues for a work."""
        work_id = 10
        mock_issues = [MagicMock(id=1), MagicMock(id=2)]
        mock_model.list_issues_for_work_id.return_value = mock_issues

        result = WorkIssuesService.find_all_work_issues(work_id)

        assert result == mock_issues
        mock_model.list_issues_for_work_id.assert_called_once_with(work_id)


class TestFindWorkIssueById:
    """Tests for find_work_issue_by_id method."""

    @patch("api.services.work_issues.WorkIssuesModel")
    def test_finds_issue_by_id(self, mock_model):
        """Test finding work issue by ID."""
        issue_id = 5
        mock_issue = MagicMock(id=issue_id)
        mock_model.find_by_id.return_value = mock_issue

        result = WorkIssuesService.find_work_issue_by_id(issue_id)

        assert result == mock_issue
        mock_model.find_by_id.assert_called_once_with(issue_id)


class TestFindWorkIssuesByWorkIds:
    """Tests for find_work_issues_by_work_ids method."""

    @patch("api.services.work_issues.WorkIssueQuery")
    def test_finds_issues_by_multiple_work_ids(self, mock_query):
        """Test finding work issues by list of work IDs."""
        work_ids = [1, 2, 3]
        mock_results = [MagicMock(work_id=1), MagicMock(work_id=2)]
        mock_query.find_work_issues_by_work_ids.return_value = mock_results

        result = WorkIssuesService.find_work_issues_by_work_ids(work_ids)

        assert result == mock_results
        mock_query.find_work_issues_by_work_ids.assert_called_once_with(work_ids)


class TestFetchIssuesForAllWorks:
    """Tests for fetch_issues_for_all_works method."""

    @patch("api.services.work_issues.WorkIssuesService._serialize_issue")
    @patch("api.services.work_issues.WorkIssueUpdatesResponseSchema")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.Work")
    def test_fetches_and_filters_issues(self, mock_work, mock_issues_model, mock_schema, mock_serialize):
        """Test fetching all work issues with filtering."""
        pagination_options = MagicMock(page=1, size=10, sort_key=None)
        search_options = MagicMock(
            is_approved=None,
            staleness=None,
            issue_state=None
        )

        mock_work1 = MagicMock(id=1)
        mock_work2 = MagicMock(id=2)
        mock_work.fetch_all_works_by_work_issues.return_value = ([mock_work1, mock_work2], 2)

        mock_update = MagicMock(is_approved=True, posted_date=datetime.now(timezone.utc))
        mock_issue1 = MagicMock(work_id=1, updates=[mock_update], is_active=True, is_resolved=False)
        mock_issue2 = MagicMock(work_id=2, updates=[mock_update], is_active=True, is_resolved=False)
        mock_issues_model.list_all_issues_for_work_ids.return_value = [mock_issue1, mock_issue2]

        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.get_staleness.return_value = StalenessEnum.GOOD.value

        mock_serialize.side_effect = [
            {"work_id": 1, "issue": {}},
            {"work_id": 2, "issue": {}}
        ]

        result = WorkIssuesService.fetch_issues_for_all_works(pagination_options, search_options)

        assert "items" in result
        assert "total" in result
        assert len(result["items"]) == 2

    @patch("api.services.work_issues.WorkIssuesService._serialize_issue")
    @patch("api.services.work_issues.WorkIssueUpdatesResponseSchema")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.Work")
    def test_filters_by_approval_status(self, mock_work, mock_issues_model, mock_schema, mock_serialize):
        """Test filtering issues by approval status."""
        pagination_options = MagicMock(page=1, size=10, sort_key=None)
        search_options = MagicMock(
            is_approved=["true"],
            staleness=None,
            issue_state=None
        )

        mock_work1 = MagicMock(id=1)
        mock_work.fetch_all_works_by_work_issues.return_value = ([mock_work1], 1)

        mock_approved_update = MagicMock(is_approved=True)
        mock_issue_approved = MagicMock(work_id=1, updates=[mock_approved_update], is_active=True, is_resolved=False)
        mock_issues_model.list_all_issues_for_work_ids.return_value = [mock_issue_approved]

        result = WorkIssuesService.fetch_issues_for_all_works(pagination_options, search_options)

        assert result["total"] == 1

    @patch("api.services.work_issues.WorkIssuesService._serialize_issue")
    @patch("api.services.work_issues.WorkIssueUpdatesResponseSchema")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.Work")
    def test_filters_by_staleness(self, mock_work, mock_issues_model, mock_schema, mock_serialize):
        """Test filtering issues by staleness."""
        pagination_options = MagicMock(page=1, size=10, sort_key=None)
        search_options = MagicMock(
            is_approved=None,
            staleness=[StalenessEnum.GOOD.value],
            issue_state=None
        )

        mock_work1 = MagicMock(id=1)
        mock_work.fetch_all_works_by_work_issues.return_value = ([mock_work1], 1)

        mock_update = MagicMock(is_approved=True)
        mock_issue = MagicMock(work_id=1, updates=[mock_update], is_active=True, is_resolved=False)
        mock_issues_model.list_all_issues_for_work_ids.return_value = [mock_issue]

        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.get_staleness.return_value = StalenessEnum.GOOD.value

        mock_serialize.return_value = {"work_id": 1, "issue": {}}

        result = WorkIssuesService.fetch_issues_for_all_works(pagination_options, search_options)

        assert result["total"] == 1

    @patch("api.services.work_issues.WorkIssuesService._serialize_issue")
    @patch("api.services.work_issues.WorkIssueUpdatesResponseSchema")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.Work")
    def test_paginates_results(self, mock_work, mock_issues_model, mock_schema, mock_serialize):
        """Test pagination of filtered results."""
        pagination_options = MagicMock(page=2, size=2, sort_key=None)
        search_options = MagicMock(is_approved=None, staleness=None, issue_state=None)

        works = [MagicMock(id=i) for i in range(1, 6)]
        mock_work.fetch_all_works_by_work_issues.return_value = (works, 5)

        issues = []
        for i in range(1, 6):
            mock_update = MagicMock(is_approved=True)
            mock_issue = MagicMock(work_id=i, updates=[mock_update], is_active=True, is_resolved=False)
            issues.append(mock_issue)
        mock_issues_model.list_all_issues_for_work_ids.return_value = issues

        mock_serialize.side_effect = [{"work_id": i, "issue": {}} for i in range(1, 6)]

        result = WorkIssuesService.fetch_issues_for_all_works(pagination_options, search_options)

        assert result["total"] == 5
        assert len(result["items"]) == 2  # Page 2, size 2 should return 2 items


class TestSerializeIssue:
    """Tests for _serialize_issue static method."""

    @patch("api.services.work_issues.WorkIssuesResponseSchema")
    def test_serializes_issue_data(self, mock_schema):
        """Test serializing issue with work data."""
        mock_project = MagicMock()
        mock_project.name = "Test Project"
        mock_work_type = MagicMock()
        mock_work_type.name = "Assessment"
        mock_work = MagicMock(
            id=10,
            title="Test Work",
            project=mock_project,
            work_type=mock_work_type
        )
        mock_issue = MagicMock(id=5)

        mock_schema_instance = MagicMock()
        mock_schema.return_value = mock_schema_instance
        mock_schema_instance.dump.return_value = {"id": 5}

        result = WorkIssuesService._serialize_issue(mock_work, mock_issue)

        assert result["work_id"] == 10
        assert result["work_name"] == "Test Work"
        assert result["project_name"] == "Test Project"
        assert result["work_type"] == "Assessment"
        assert result["issue"] == {"id": 5}

    def test_serializes_with_none_issue(self):
        """Test serializing when issue is None."""
        mock_project = MagicMock()
        mock_project.name = "Project"
        mock_work_type = MagicMock()
        mock_work_type.name = "Assessment"
        mock_work = MagicMock(
            id=10,
            title="Test Work",
            project=mock_project,
            work_type=mock_work_type
        )

        result = WorkIssuesService._serialize_issue(mock_work, None)

        assert result["work_id"] == 10
        assert result["issue"] is None


class TestCreateWorkIssueAndUpdates:
    """Tests for create_work_issue_and_updates method."""

    @patch("api.services.work_issues.WorkIssuesService.create_special_fields")
    @patch("api.services.work_issues.WorkIssuesService._check_create_auth")
    @patch("api.services.work_issues.WorkIssueUpdatesModel")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.db")
    def test_creates_issue_with_updates(
        self, mock_db, mock_model, mock_update_model, mock_check_auth, mock_create_fields
    ):
        """Test creating work issue with updates."""
        work_id = 10
        issue_data = {
            "title": "Test Issue",
            "start_date": datetime(2024, 1, 1, tzinfo=timezone.utc),
            "is_active": True,
            "updates": ["First update", "Second update"],
        }

        mock_issue = MagicMock(id=100)
        mock_model.return_value = mock_issue

        result = WorkIssuesService.create_work_issue_and_updates(work_id, issue_data)

        assert result == mock_issue
        mock_check_auth.assert_called_once_with(work_id)
        mock_db.session.add.assert_called()
        mock_db.session.flush.assert_called_once()
        mock_create_fields.assert_called_once()
        # Should create 2 updates
        assert mock_db.session.add.call_count == 3  # 1 issue + 2 updates

    @patch("api.services.work_issues.WorkIssuesService.create_special_fields")
    @patch("api.services.work_issues.WorkIssuesService._check_create_auth")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.db")
    def test_creates_issue_without_updates(
        self, mock_db, mock_model, mock_check_auth, mock_create_fields
    ):
        """Test creating work issue without updates."""
        work_id = 10
        issue_data = {
            "title": "Test Issue",
            "start_date": datetime(2024, 1, 1, tzinfo=timezone.utc),
            "is_active": True,
        }

        mock_issue = MagicMock(id=100, is_active=True, start_date=datetime(2024, 1, 1, tzinfo=timezone.utc))
        mock_model.return_value = mock_issue

        result = WorkIssuesService.create_work_issue_and_updates(work_id, issue_data)

        assert result == mock_issue
        # Should add the issue
        mock_db.session.add.assert_called_with(mock_issue)
        mock_create_fields.assert_called_once()


class TestAddWorkIssueUpdate:
    """Tests for add_work_issue_update method."""

    @patch("api.services.work_issues.WorkIssuesService._check_update_date_validity")
    @patch("api.services.work_issues.WorkIssuesService._check_create_auth")
    @patch("api.services.work_issues.WorkIssuesModel")
    @patch("api.services.work_issues.WorkIssueUpdatesModel")
    def test_adds_update_to_existing_issue(
        self, mock_update_model, mock_model, mock_check_auth, mock_check_validity
    ):
        """Test adding update to existing work issue."""
        work_id = 10
        issue_id = 5
        data = {
            "description": "New update",
            "posted_date": datetime(2024, 5, 1, tzinfo=timezone.utc)
        }

        mock_issue = MagicMock(id=issue_id)
        mock_model.find_by_params.return_value = [mock_issue]
        mock_model.find_by_id.return_value = mock_issue

        mock_new_update = MagicMock()
        mock_update_model.return_value = mock_new_update

        result = WorkIssuesService.add_work_issue_update(work_id, issue_id, data)

        assert result == mock_issue
        mock_check_auth.assert_called_once_with(work_id)
        mock_check_validity.assert_called_once_with(mock_issue, data)
        mock_new_update.save.assert_called_once()

    @patch("api.services.work_issues.WorkIssuesModel")
    def test_raises_when_issue_not_found(self, mock_model):
        """Test raises error when work issue not found."""
        work_id = 10
        issue_id = 999
        data = {"description": "Update"}

        mock_model.find_by_params.return_value = []

        with pytest.raises(ResourceNotFoundError, match="Work issue not found"):
            WorkIssuesService.add_work_issue_update(work_id, issue_id, data)


class TestApproveWorkIssues:
    """Tests for approve_work_issues method."""

    @patch("api.services.work_issues.TokenInfo")
    @patch("api.services.work_issues.WorkIssuesService._check_edit_auth")
    @patch("api.services.work_issues.WorkIssueUpdatesModel")
    def test_approves_work_issue_update(self, mock_update_model, mock_check_auth, mock_token):
        """Test approving a work issue update."""
        issue_id = 5
        update_id = 10

        mock_work_issue = MagicMock(work_id=100)
        mock_update = MagicMock(work_issue=mock_work_issue)
        mock_update_model.find_by_params.return_value = [mock_update]
        mock_token.get_username.return_value = "admin_user"

        result = WorkIssuesService.approve_work_issues(issue_id, update_id)

        assert result == mock_update
        assert mock_update.is_approved is True
        assert mock_update.approved_by == "admin_user"
        mock_check_auth.assert_called_once_with(100)
        mock_update.save.assert_called_once()

    @patch("api.services.work_issues.WorkIssueUpdatesModel")
    def test_raises_when_update_not_found(self, mock_update_model):
        """Test raises error when update doesn't exist."""
        issue_id = 5
        update_id = 999

        mock_update_model.find_by_params.return_value = []

        with pytest.raises(ResourceNotFoundError, match="Work issue Description doesnt exist"):
            WorkIssuesService.approve_work_issues(issue_id, update_id)


class TestEditIssue:
    """Tests for edit_issue method."""

    @patch("api.services.work_issues.WorkIssuesService.update_special_field")
    @patch("api.services.work_issues.WorkIssuesService.create_special_fields")
    @patch("api.services.work_issues.WorkIssuesService._check_valid_issue_edit_data")
    @patch("api.services.work_issues.WorkIssuesService._check_edit_auth")
    @patch("api.services.work_issues.WorkIssuesService.find_work_issue_by_id")
    @patch("api.services.work_issues.datetime")
    def test_edits_issue_with_changes(
        self, mock_datetime, mock_find, mock_check_auth, mock_check_valid, mock_create_fields, mock_update_field
    ):
        """Test editing work issue with changes."""
        work_id = 10
        issue_id = 5
        old_start = datetime(2024, 1, 1, tzinfo=timezone.utc)
        new_start = datetime(2024, 2, 1, tzinfo=timezone.utc)
        mock_now = datetime(2024, 5, 15, tzinfo=timezone.utc)
        mock_datetime.now.return_value = mock_now

        issue_data = {
            "title": "Updated Title",
            "is_active": False,
            "start_date": new_start,
        }

        mock_issue = MagicMock(
            id=issue_id,
            title="Old Title",
            is_active=True,
            start_date=old_start
        )
        mock_find.return_value = mock_issue

        result = WorkIssuesService.edit_issue(work_id, issue_id, issue_data)

        assert result == mock_issue
        mock_check_auth.assert_called_once_with(work_id)
        mock_check_valid.assert_called_once_with(issue_data, mock_issue)
        mock_create_fields.assert_called_once()  # is_active changed
        mock_update_field.assert_called_once()  # start_date changed
        mock_issue.save.assert_called_once()

    @patch("api.services.work_issues.WorkIssuesService.find_work_issue_by_id")
    def test_raises_when_issue_not_found(self, mock_find):
        """Test raises error when issue doesn't exist."""
        work_id = 10
        issue_id = 999
        issue_data = {"title": "Updated"}

        mock_find.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Work issue doesnt exist"):
            WorkIssuesService.edit_issue(work_id, issue_id, issue_data)


class TestEditIssueUpdate:
    """Tests for edit_issue_update method."""

    @patch("api.services.work_issues.WorkIssuesService._check_update_date_validity")
    @patch("api.services.work_issues.WorkIssuesService._check_edit_update_auth")
    @patch("api.services.work_issues.WorkIssueUpdatesModel")
    @patch("api.services.work_issues.WorkIssuesService.find_work_issue_by_id")
    def test_edits_issue_update(
        self, mock_find_issue, mock_update_model, mock_check_auth, mock_check_validity
    ):
        """Test editing work issue update."""
        issue_id = 5
        issue_update_id = 10
        issue_update_data = {
            "description": "Updated description",
            "posted_date": datetime(2024, 5, 1, tzinfo=timezone.utc)
        }

        mock_issue = MagicMock(id=issue_id, work_id=100)
        mock_find_issue.return_value = mock_issue

        mock_update = MagicMock(id=issue_update_id)
        mock_update_model.find_by_id.return_value = mock_update

        result = WorkIssuesService.edit_issue_update(issue_id, issue_update_id, issue_update_data)

        assert result == mock_update
        assert mock_update.description == "Updated description"
        mock_check_auth.assert_called_once_with(100, mock_update)
        mock_check_validity.assert_called_once()
        mock_update.save.assert_called_once()

    @patch("api.services.work_issues.WorkIssuesService.find_work_issue_by_id")
    def test_raises_when_update_not_found(self, mock_find_issue):
        """Test raises error when update doesn't exist."""
        issue_id = 5
        issue_update_id = 999
        issue_update_data = {"description": "Updated"}

        mock_issue = MagicMock(id=issue_id)
        mock_find_issue.return_value = mock_issue

        with patch("api.services.work_issues.WorkIssueUpdatesModel") as mock_update_model:
            mock_update_model.find_by_id.return_value = None

            with pytest.raises(ResourceNotFoundError, match="Issue Description doesnt exist"):
                WorkIssuesService.edit_issue_update(issue_id, issue_update_id, issue_update_data)


class TestCheckUpdateDateValidity:
    """Tests for _check_update_date_validity private method."""

    def test_raises_when_posted_before_issue_start(self):
        """Test raises error when posted_date is before issue start_date."""
        work_issue = MagicMock(
            start_date=datetime(2024, 5, 1, tzinfo=timezone.utc),
            updates=[]
        )
        update_data = {"posted_date": datetime(2024, 4, 1, tzinfo=timezone.utc)}

        with pytest.raises(BadRequestError, match="posted date cannot be before the work issue start date"):
            WorkIssuesService._check_update_date_validity(work_issue, update_data)

    def test_raises_when_before_last_approved_update(self):
        """Test raises error when posted_date is not greater than last approved update."""
        approved_update = MagicMock(
            id=1,
            posted_date=datetime(2024, 5, 15, tzinfo=timezone.utc),
            is_approved=True
        )
        work_issue = MagicMock(
            start_date=datetime(2024, 5, 1, tzinfo=timezone.utc),
            updates=[approved_update]
        )
        update_data = {"posted_date": datetime(2024, 5, 10, tzinfo=timezone.utc)}

        with pytest.raises(BadRequestError, match="posted date must be greater than last update"):
            WorkIssuesService._check_update_date_validity(work_issue, update_data, issue_update_id=2)

    def test_raises_when_exceeds_pending_update(self):
        """Test raises error when posted_date exceeds pending unapproved update."""
        unapproved_update = MagicMock(
            id=2,
            posted_date=datetime(2024, 5, 20, tzinfo=timezone.utc),
            is_approved=False
        )
        work_issue = MagicMock(
            start_date=datetime(2024, 5, 1, tzinfo=timezone.utc),
            updates=[unapproved_update]
        )
        update_data = {"posted_date": datetime(2024, 5, 25, tzinfo=timezone.utc)}

        with pytest.raises(BadRequestError, match="Cannot exceed the posted date of a pending unapproved update"):
            WorkIssuesService._check_update_date_validity(work_issue, update_data, issue_update_id=1)

    def test_valid_date_passes(self):
        """Test valid date passes validation."""
        approved_update = MagicMock(
            id=1,
            posted_date=datetime(2024, 5, 10, tzinfo=timezone.utc),
            is_approved=True
        )
        work_issue = MagicMock(
            start_date=datetime(2024, 5, 1, tzinfo=timezone.utc),
            updates=[approved_update]
        )
        update_data = {"posted_date": datetime(2024, 5, 15, tzinfo=timezone.utc)}

        # Should not raise
        WorkIssuesService._check_update_date_validity(work_issue, update_data)
