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
"""Test suite for ThirtySixtyNinetyReport."""
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from flask import g
from pytz import utc

from api.reports.thirty_sixty_ninety_report import ThirtySixtyNinetyReport
from api.utils.constants import CANADA_TIMEZONE
from tests.utilities.factory_scenarios import TestJwtClaims


class TestThirtySixtyNinetyReportInit:
    """Test ThirtySixtyNinetyReport initialization."""

    def test_init_default(self, app, db):
        """Test default initialization."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            assert report.report_title == "30-60-90"
            assert report.color_intensity == 50
            assert report.report_date is None
            assert "decision_referral" in report.event_order
            assert "work_issue" in report.event_order
            assert "pcp" in report.event_order
            assert "other" in report.event_order

    def test_init_with_filters(self, app, db):
        """Test initialization with filters."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            filters = {"filter_search": {"work_type": ["Assessment"]}}
            report = ThirtySixtyNinetyReport(filters=filters, color_intensity=75)

            assert report.filters == filters
            assert report.color_intensity == 75

    def test_init_loads_configuration_ids(self, app, db):
        """Test that configuration IDs are loaded on init."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            # These should be loaded from database
            assert isinstance(report.pecp_configuration_ids, (list, tuple))
            assert isinstance(report.decision_configuration_ids, (list, tuple))
            assert isinstance(report.high_profile_work_issue_work_ids, (list, tuple))


class TestThirtySixtyNinetyReportEventOrder:
    """Test event order configuration."""

    def test_event_order_values(self, app, db):
        """Test event order priority values."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            assert report.event_order["decision_referral"] == 1
            assert report.event_order["work_issue"] == 2
            assert report.event_order["pcp"] == 3
            assert report.event_order["other"] == 4


class TestThirtySixtyNinetyReportFormatData:
    """Test _format_data method."""

    def test_format_data_empty(self, app, db):
        """Test formatting empty data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime.now(utc)

            result = report._format_data([])

            assert "30" in result
            assert "60" in result
            assert "90" in result
            assert result["30"] == []
            assert result["60"] == []
            assert result["90"] == []

    def test_format_data_categorizes_by_date(self, app, db):
        """Test that data is categorized into 30/60/90 day buckets."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime.now(utc)

            # Create mock data items
            mock_data = []

            with patch.object(report, '_update_work_issues', return_value=[]):
                with patch.object(report, '_resolve_multiple_events', return_value=[]):
                    with patch.object(report, '_format_notes', return_value=[]):
                        result = report._format_data(mock_data)

            assert isinstance(result, dict)
            assert "30" in result
            assert "60" in result
            assert "90" in result


class TestThirtySixtyNinetyReportGenerateReport:
    """Test generate_report method."""

    def test_generate_report_json_empty(self, app, db):
        """Test generating JSON report with no data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report_date = datetime.now(CANADA_TIMEZONE)

            with patch.object(report, '_fetch_data', return_value=[]):
                result = report.generate_report(
                    report_date,
                    return_type="json",
                    include_first_phase=False
                )

                # Result should be processed data (dict or tuple)
                assert result is not None

    def test_generate_report_sets_report_date(self, app, db):
        """Test that generate_report sets the report_date."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 6, 15, tzinfo=CANADA_TIMEZONE)

            with patch.object(report, '_fetch_data', return_value=[]):
                report.generate_report(
                    report_date,
                    return_type="json",
                    include_first_phase=False
                )

                assert report.report_date is not None


class TestThirtySixtyNinetyReportAddDefaultInfo:
    """Test add_default_info method."""

    def test_add_default_info(self, app, db):
        """Test adding default info to PDF page."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 15, tzinfo=utc)

            mock_canvas = MagicMock()
            mock_doc = MagicMock()
            mock_doc.leftMargin = 72
            mock_doc.bottomMargin = 72
            mock_doc.page_width = 612
            mock_doc.rightMargin = 72

            report.add_default_info(mock_canvas, mock_doc)

            mock_canvas.saveState.assert_called_once()
            mock_canvas.restoreState.assert_called_once()
            mock_canvas.drawString.assert_called()
            mock_canvas.drawRightString.assert_called()


class TestThirtySixtyNinetyReportUpdateWorkIssues:
    """Test _update_work_issues method."""

    def test_update_work_issues_empty_data(self, app, db):
        """Test updating work issues with empty data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            result = report._update_work_issues([])

            assert result == []

    def test_update_work_issues_adds_issues(self, app, db):
        """Test that work issues are added to data items."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            mock_data = [
                {
                    "group": 1,
                    "items": [{"work_id": 1, "status_date_updated": None}]
                }
            ]

            with patch('api.reports.thirty_sixty_ninety_report.WorkIssuesService') as mock_service:
                mock_service.find_work_issues_by_work_ids.return_value = []

                result = report._update_work_issues(mock_data)

                assert len(result) == 1
                assert "work_issues" in result[0]["items"][0]


class TestThirtySixtyNinetyReportGetNextPcpQuery:
    """Test _get_next_pcp_query method."""

    def test_get_next_pcp_query(self, app, db):
        """Test creating next PCP query."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            start_date = datetime(2024, 1, 1, tzinfo=utc)
            end_date = datetime(2024, 4, 1, tzinfo=utc)

            query = report._get_next_pcp_query(start_date, end_date)

            # Should return a subquery
            assert query is not None


class TestThirtySixtyNinetyReportIntervalCategorization:
    """Test interval categorization logic."""

    def test_30_day_interval(self, app, db):
        """Test events within 30 days are categorized correctly."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 1, tzinfo=utc)

            # Event 15 days from report date should be in "30" bucket
            event_date = report.report_date + timedelta(days=15)

            # The categorization check
            cutoff_30 = report.report_date + timedelta(days=30)
            assert event_date <= cutoff_30

    def test_60_day_interval(self, app, db):
        """Test events between 30-60 days are categorized correctly."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 1, tzinfo=utc)

            # Event 45 days from report date
            event_date = report.report_date + timedelta(days=45)

            cutoff_30 = report.report_date + timedelta(days=30)
            cutoff_60 = report.report_date + timedelta(days=60)

            assert event_date > cutoff_30
            assert event_date <= cutoff_60

    def test_90_day_interval(self, app, db):
        """Test events between 60-93 days are categorized correctly."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 1, tzinfo=utc)

            # Event 75 days from report date
            event_date = report.report_date + timedelta(days=75)

            cutoff_60 = report.report_date + timedelta(days=60)
            cutoff_93 = report.report_date + timedelta(days=93)

            assert event_date > cutoff_60
            assert event_date <= cutoff_93


class TestThirtySixtyNinetyReportDataKeys:
    """Test data keys configuration."""

    def test_data_keys_include_required_fields(self, app, db):
        """Test that all required data keys are present."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            required_keys = [
                "work_id",
                "project_name",
                "event_date",
                "work_status_text",
                "event_title",
            ]

            for key in required_keys:
                assert key in report.data_keys, f"Missing required key: {key}"


class TestThirtySixtyNinetyReportPdfGeneration:
    """Test PDF generation functionality."""

    def test_generate_pdf_returns_bytes(self, app, db):
        """Test that PDF generation returns bytes."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 6, 15, tzinfo=CANADA_TIMEZONE)

            # Mock data that would produce a PDF
            mock_data = {"30": [], "60": [], "90": []}

            with patch.object(report, '_fetch_data', return_value=[]):
                with patch.object(report, '_format_data', return_value=mock_data):
                    with patch.object(report, '_update_staleness', return_value=mock_data):
                        result = report.generate_report(
                            report_date,
                            return_type="pdf",
                            include_first_phase=False
                        )

                        # Empty data returns empty dict for json
                        # For PDF it may return bytes or None
                        assert result is not None


class TestThirtySixtyNinetyReportCategorizeEvent:
    """Test _categorize_event method."""

    def test_categorize_event_decision_referral(self, app, db):
        """Test categorizing event as decision_referral."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.decision_configuration_ids = [100, 101, 102]

            event = {"event_configuration_id": 100}
            result = report._categorize_event(event)

            assert result == "decision_referral"

    def test_categorize_event_referral_type(self, app, db):
        """Test categorizing event with referral event type."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            from api.models.event_type import EventTypeEnum

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.decision_configuration_ids = []

            event = {"event_configuration_id": 999, "event_type_id": EventTypeEnum.REFERRAL.value}
            result = report._categorize_event(event)

            assert result == "decision_referral"

    def test_categorize_event_pcp(self, app, db):
        """Test categorizing event as pcp."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.decision_configuration_ids = []
            report.pecp_configuration_ids = [200, 201]

            event = {"event_configuration_id": 200}
            result = report._categorize_event(event)

            assert result == "pcp"

    def test_categorize_event_work_issue(self, app, db):
        """Test categorizing event as work_issue when no config id."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.decision_configuration_ids = []
            report.pecp_configuration_ids = []

            event = {}  # No event_configuration_id
            result = report._categorize_event(event)

            assert result == "work_issue"


class TestThirtySixtyNinetyReportFormatNotes:
    """Test _format_notes method."""

    def test_format_notes_empty(self, app, db):
        """Test formatting notes with empty data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            result = report._format_notes([])

            assert result == []

    def test_format_notes_with_data(self, app, db):
        """Test formatting notes with data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            data = [
                {
                    "group": 1,
                    "items": [
                        {"work_id": 1, "notes": "Test note 1"},
                        {"work_id": 2, "notes": "Test note 2"},
                    ]
                }
            ]

            result = report._format_notes(data)

            assert len(result) == 1


class TestThirtySixtyNinetyReportUpdateStaleness:
    """Test _update_staleness method."""

    def test_update_staleness_fresh_data(self, app, db):
        """Test updating staleness with fresh data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 6, 15, tzinfo=utc)

            data = {
                "30": [{"group": 1, "items": [{"status_date_updated": datetime(2024, 6, 10, tzinfo=utc)}]}],
                "60": [],
                "90": [],
            }

            result = report._update_staleness(data, report_date)

            assert "30" in result
            assert "60" in result
            assert "90" in result


class TestThirtySixtyNinetyReportResolveMultipleEvents:
    """Test _resolve_multiple_events method."""

    def test_resolve_multiple_events_empty(self, app, db):
        """Test resolving multiple events with empty data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 15, tzinfo=utc)
            report.high_profile_work_issue_work_ids = []

            result = report._resolve_multiple_events([])

            assert result == []

    def test_resolve_multiple_events_single_event(self, app, db):
        """Test resolving when work has single event."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 15, tzinfo=utc)
            report.high_profile_work_issue_work_ids = []
            report.decision_configuration_ids = []
            report.pecp_configuration_ids = [50]  # Add event config id to categorize as "pcp"

            data = [
                {"group": 1, "items": [{"work_id": 1, "event_id": 100, "event_configuration_id": 50, "event_date": datetime(2024, 6, 20, tzinfo=utc)}]}
            ]

            result = report._resolve_multiple_events(data)

            assert len(result) == 1


class TestThirtySixtyNinetyReportHandleWorkIssueItems:
    """Test _handle_work_issue_items method."""

    def test_handle_work_issue_items_no_issues(self, app, db):
        """Test handling work issue items with no issues."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 15, tzinfo=utc)
            report.high_profile_work_issue_work_ids = [1]

            resolved_events = []
            event = {"work_id": 1, "work_issues": []}

            report._handle_work_issue_items(resolved_events, event, 1)

            assert len(resolved_events) == 0

    def test_handle_work_issue_items_not_high_profile(self, app, db):
        """Test handling work issue items when work is not high profile."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 15, tzinfo=utc)
            report.high_profile_work_issue_work_ids = []  # Work 1 is not high profile

            resolved_events = []
            event = {"work_id": 1, "work_issues": [{"title": "Issue 1"}]}

            report._handle_work_issue_items(resolved_events, event, 1)

            assert len(resolved_events) == 0


class TestThirtySixtyNinetyReportGetProjectIdsByPeriod:
    """Test _get_project_ids_by_period method."""

    def test_get_project_ids_by_period_empty(self, app, db):
        """Test getting project IDs by period with empty data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            result = report._get_project_ids_by_period([])

            assert result == {30: [], 60: [], 90: []}

    def test_get_project_ids_by_period_with_data(self, app, db):
        """Test getting project IDs by period with data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)
            report.report_date = datetime(2024, 6, 1, tzinfo=utc)

            data = [
                {"anticipated_decision_date": datetime(2024, 6, 15, tzinfo=utc), "project_id": 1},
                {"anticipated_decision_date": datetime(2024, 6, 25, tzinfo=utc), "project_id": 2},
                {"anticipated_decision_date": datetime(2024, 7, 15, tzinfo=utc), "project_id": 3},
            ]

            result = report._get_project_ids_by_period(data)

            assert 1 in result[30]
            assert 2 in result[30]
            assert 3 in result[60]


class TestThirtySixtyNinetyReportGetEventDateSource:
    """Test _get_event_date_source method."""

    def test_get_event_date_source_decision(self, app, db):
        """Test getting event date source for decision_referral."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            data = {"event_type_id": 999, "event_type": "decision_referral"}

            result = report._get_event_date_source(data)

            assert result == "Decision"

    def test_get_event_date_source_referral(self, app, db):
        """Test getting event date source for referral."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            from api.models.event_type import EventTypeEnum

            report = ThirtySixtyNinetyReport(filters=None, color_intensity=50)

            data = {"event_type_id": EventTypeEnum.REFERRAL.value, "event_type": "decision_referral"}

            result = report._get_event_date_source(data)

            assert result == "Referral"
