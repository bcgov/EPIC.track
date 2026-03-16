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
"""Test suite for EAResourceForeCastReport."""
from datetime import datetime
from http import HTTPStatus
from unittest.mock import MagicMock, patch
from urllib.parse import urljoin


from faker import Faker
from flask import g

from api.reports.resource_forecast_report import EAResourceForeCastReport
from api.utils.constants import CANADA_TIMEZONE
from tests.utilities.factory_scenarios import TestJwtClaims

API_BASE_URL = "/api/v1/"
fake = Faker()


class TestEAResourceForeCastReportInit:
    """Test EAResourceForeCastReport initialization."""

    def test_init_default(self, app):
        """Test default initialization."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            assert report.report_title == "EAO Resource Forecast"
            assert report.color_intensity == 50
            assert report.excluded_items == []
            assert report.months == []
            assert report.month_labels == []
            assert "PROJECT BACKGROUND" in report.report_cells
            assert "EAO RESOURCING" in report.report_cells
            assert "QUARTERS" in report.report_cells
            assert "Expected Referral Date" in report.report_cells

    def test_init_with_filters(self, app):
        """Test initialization with filters."""
        with app.app_context():
            filters = {
                "exclude": ["capital_investment", "iaac"],
                "filter_search": {"ea_act": ["2018"]},
            }
            report = EAResourceForeCastReport(filters=filters, color_intensity=75)

            assert report.filters == filters
            assert report.excluded_items == ["capital_investment", "iaac"]
            assert report.color_intensity == 75

    def test_init_with_empty_filters(self, app):
        """Test initialization with empty filters dict."""
        with app.app_context():
            report = EAResourceForeCastReport(filters={}, color_intensity=100)

            assert report.filters == {}
            assert report.excluded_items == []


class TestEAResourceForeCastReportFilterWorkEvents:
    """Test _filter_work_events method."""

    def test_filter_work_events_with_matching_events(self, app):
        """Test filtering events returns only events for specified work_id."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            events = [
                {"work_id": 1, "name": "Event 1"},
                {"work_id": 2, "name": "Event 2"},
                {"work_id": 1, "name": "Event 3"},
                {"work_id": 3, "name": "Event 4"},
            ]

            result = report._filter_work_events(1, events)

            assert len(result) == 2
            assert all(e["work_id"] == 1 for e in result)

    def test_filter_work_events_no_matching(self, app):
        """Test filtering returns empty list when no matches."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            events = [
                {"work_id": 2, "name": "Event 2"},
                {"work_id": 3, "name": "Event 4"},
            ]

            result = report._filter_work_events(1, events)

            assert result == []

    def test_filter_work_events_empty_list(self, app):
        """Test filtering empty event list returns empty list."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            result = report._filter_work_events(1, [])

            assert result == []


class TestEAResourceForeCastReportAddMonths:
    """Test _add_months method."""

    def test_add_months_within_year(self, app):
        """Test adding months within the same year."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            start_date = datetime(2024, 3, 15)

            result = report._add_months(start_date, 2)

            assert result.year == 2024
            assert result.month == 5
            assert result.day == 31  # Last day of May

    def test_add_months_crossing_year(self, app):
        """Test adding months that crosses into next year."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            start_date = datetime(2024, 11, 15)

            result = report._add_months(start_date, 3)

            assert result.year == 2025
            assert result.month == 2
            assert result.day == 28  # Last day of Feb 2025

    def test_add_months_set_to_first(self, app):
        """Test adding months with set_to_last=False."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            start_date = datetime(2024, 3, 15)

            result = report._add_months(start_date, 2, set_to_last=False)

            assert result.year == 2024
            assert result.month == 5
            assert result.day == 1  # First day of month

    def test_add_months_december_to_january(self, app):
        """Test adding months from December to January."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            start_date = datetime(2024, 12, 15)

            result = report._add_months(start_date, 1)

            assert result.year == 2025
            assert result.month == 1
            assert result.day == 31  # Last day of January


class TestEAResourceForeCastReportSetMonthLabels:
    """Test _set_month_labels method."""

    def test_set_month_labels_q1(self, app):
        """Test setting month labels for Q1 report date."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 1, 15, tzinfo=CANADA_TIMEZONE)

            report._set_month_labels(report_date)

            assert len(report.months) == 5
            assert len(report.month_labels) == 4
            assert report.end_date is not None
            # First three labels should be full month names
            assert report.month_labels[0] == "February"
            assert report.month_labels[1] == "March"
            assert report.month_labels[2] == "April"

    def test_set_month_labels_q4(self, app):
        """Test setting month labels for Q4 report date."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 10, 15, tzinfo=CANADA_TIMEZONE)

            report._set_month_labels(report_date)

            assert len(report.months) == 5
            assert len(report.month_labels) == 4
            assert report.month_labels[0] == "November"
            assert report.month_labels[1] == "December"
            assert report.month_labels[2] == "January"


class TestEAResourceForeCastReportFormatCapitalInvestment:
    """Test _format_capital_investment method."""

    def test_format_capital_investment_with_value(self, app):
        """Test formatting capital investment with a value."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"capital_investment": 1500000}

            result = report._format_capital_investment(work_data)

            assert result["capital_investment"] == "1,500,000"

    def test_format_capital_investment_none(self, app):
        """Test formatting capital investment with None value."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"capital_investment": None}

            result = report._format_capital_investment(work_data)

            assert result["capital_investment"] is None

    def test_format_capital_investment_zero(self, app):
        """Test formatting capital investment with zero."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"capital_investment": 0}

            result = report._format_capital_investment(work_data)

            # 0 is falsy so it won't be formatted
            assert result["capital_investment"] == 0

    def test_format_capital_investment_missing_key(self, app):
        """Test formatting when capital_investment key is missing."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"other_field": "value"}

            result = report._format_capital_investment(work_data)

            assert "capital_investment" not in result


class TestEAResourceForeCastReportFormatLongRegion:
    """Test _format_long_region method."""

    def test_format_long_region_with_hyphen(self, app):
        """Test formatting long region name with hyphen."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {
                "env_region": "Vancouver-Island-Coast",
                "nrs_region": "South-Coast-Region",
            }

            result = report._format_long_region(work_data)

            assert "-\n" in result["env_region"]
            assert "-\n" in result["nrs_region"]

    def test_format_long_region_short_name(self, app):
        """Test formatting short region name (no change)."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {
                "env_region": "Vancouver",
                "nrs_region": "Coast",
            }

            result = report._format_long_region(work_data)

            assert result["env_region"] == "Vancouver"
            assert result["nrs_region"] == "Coast"

    def test_format_long_region_none_values(self, app):
        """Test formatting with None region values."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"env_region": None, "nrs_region": None}

            result = report._format_long_region(work_data)

            assert result["env_region"] is None
            assert result["nrs_region"] is None


class TestEAResourceForeCastReportFormatEaType:
    """Test _format_ea_type method."""

    def test_format_ea_type_pre_ea(self, app):
        """Test formatting Pre-EA project phase."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {
                "project_phase": "Pre-EA (EAC Assessment)",
                "ea_type": "Assessment",
            }

            result = report._format_ea_type(work_data)

            assert result["ea_type"] == "Pre-EA"

    def test_format_ea_type_other_phase(self, app):
        """Test formatting non Pre-EA project phase."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {
                "project_phase": "Process Planning",
                "ea_type": "Assessment",
            }

            result = report._format_ea_type(work_data)

            assert result["ea_type"] == "Assessment"

    def test_format_ea_type_none_phase(self, app):
        """Test formatting with None project phase."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            work_data = {"project_phase": None, "ea_type": "Assessment"}

            result = report._format_ea_type(work_data)

            assert result["ea_type"] == "Assessment"


class TestEAResourceForeCastReportFilterData:
    """Test _filter_data method."""

    def test_filter_data_no_filters(self, app):
        """Test filtering data with no filters applied."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            data_items = [
                ([{"work_id": 1, "ea_act": "2018"}],),
                ([{"work_id": 2, "ea_act": "2002"}],),
            ]

            result = report._filter_data(data_items)

            assert len(result) == 2

    def test_filter_data_with_filter_search(self, app):
        """Test filtering data with filter_search."""
        with app.app_context():
            filters = {
                "filter_search": {"ea_act": ["2018"]},
            }
            report = EAResourceForeCastReport(filters=filters, color_intensity=50)
            data_items = [
                ({"work_id": 1, "ea_act": "2018", "project_name": "Test1"},),
                ({"work_id": 2, "ea_act": "2002", "project_name": "Test2"},),
            ]

            result = report._filter_data(data_items)

            assert len(result) == 1
            assert result[0][0]["ea_act"] == "2018"

    def test_filter_data_with_global_search(self, app):
        """Test filtering data with global search."""
        with app.app_context():
            filters = {
                "filter_search": {},
                "global_search": "assessment",
            }
            report = EAResourceForeCastReport(filters=filters, color_intensity=50)
            data_items = [
                ({"work_id": 1, "work_title": "Test Assessment Project", "project_name": "Test1"},),
                ({"work_id": 2, "work_title": "Mining Project", "project_name": "Test2"},),
            ]

            result = report._filter_data(data_items)

            assert len(result) == 1
            assert "Assessment" in result[0][0]["work_title"]

    def test_filter_data_with_project_name_exclusion(self, app):
        """Test filtering data with project name exclusion."""
        with app.app_context():
            filters = {
                "filter_search": {"project_name": ["Excluded Project"]},
            }
            report = EAResourceForeCastReport(filters=filters, color_intensity=50)
            data_items = [
                ({"work_id": 1, "project_name": "Excluded Project"},),
                ({"work_id": 2, "project_name": "Included Project"},),
            ]

            result = report._filter_data(data_items)

            assert len(result) == 1
            assert result[0][0]["project_name"] == "Included Project"


class TestEAResourceForeCastReportFilterStartEvents:
    """Test _filter_start_events method."""

    def test_filter_start_events(self, app):
        """Test filtering start events from event list."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            # Create mock events with required attributes
            mock_event1 = MagicMock()
            mock_event1.work_id = 1
            mock_event1.actual_date = datetime(2024, 1, 15)
            mock_event1.anticipated_date = datetime(2024, 1, 10)
            mock_event1.event_configuration.work_phase.name = "Phase 1"
            mock_event1.event_configuration.work_phase.start_date = datetime(2024, 1, 1)
            mock_event1.event_configuration.work_phase.end_date = datetime(2024, 3, 31)
            mock_event1.event_configuration.work_phase.phase.color = "#FF0000"
            mock_event1.event_configuration.event_position.value = "START"

            mock_event2 = MagicMock()
            mock_event2.work_id = 1
            mock_event2.actual_date = None
            mock_event2.anticipated_date = datetime(2024, 4, 15)
            mock_event2.event_configuration.work_phase.name = "Phase 2"
            mock_event2.event_configuration.work_phase.start_date = datetime(2024, 4, 1)
            mock_event2.event_configuration.work_phase.end_date = datetime(2024, 6, 30)
            mock_event2.event_configuration.work_phase.phase.color = "#00FF00"
            mock_event2.event_configuration.event_position.value = "END"  # Not a start event

            from api.models.event_template import EventPositionEnum
            mock_event1.event_configuration.event_position.value = EventPositionEnum.START.value
            mock_event2.event_configuration.event_position.value = EventPositionEnum.END.value

            result = report._filter_start_events([mock_event1, mock_event2])

            assert len(result) == 1
            assert result[0]["work_id"] == 1
            assert result[0]["event_phase"] == "Phase 1"
            assert result[0]["start_date"] == datetime(2024, 1, 15)  # Uses actual_date


class TestEAResourceForeCastReportGetQuarterSectionMetaData:
    """Test _get_quarter_section_meta_data method."""

    def test_get_quarter_section_meta_data_q1(self, app):
        """Test getting quarter section metadata for Q1."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report._set_month_labels(datetime(2024, 1, 15, tzinfo=CANADA_TIMEZONE))
            report_date = datetime(2024, 1, 15, tzinfo=CANADA_TIMEZONE)

            s_headings, c_headings, c_widths, styles = (
                report._get_quarter_section_meta_data(
                    report_date, cell_index=10, available_width=1000, total_proportion=1.0
                )
            )

            assert "Q1" in s_headings[0] or "Q2" in s_headings[-1]
            assert len(c_headings) == 4  # 4 month labels
            assert len(c_widths) == 4
            assert len(styles) > 0


class TestEAResourceForeCastReportOtherSectionMetaData:
    """Test _get_other_section_meta_data method."""

    def test_get_other_section_meta_data_project_background(self, app):
        """Test getting other section metadata for PROJECT BACKGROUND."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            cells = [
                {"data_key": "work_title", "label": "WORK TITLE", "width": 0.055},
                {"data_key": "capital_investment", "label": "EST. CAP. INVESTMENT", "width": 0.069},
            ]

            s_headings, styles, filtered_cells = report._get_other_section_meta_data(
                "PROJECT BACKGROUND", cells, cell_index=0
            )

            assert "PROJECT BACKGROUND" in s_headings
            assert len(filtered_cells) == 2
            assert len(styles) > 0

    def test_get_other_section_meta_data_with_exclusions(self, app):
        """Test getting section metadata with excluded items."""
        with app.app_context():
            filters = {"exclude": ["capital_investment"]}
            report = EAResourceForeCastReport(filters=filters, color_intensity=50)
            cells = [
                {"data_key": "work_title", "label": "WORK TITLE", "width": 0.055},
                {"data_key": "capital_investment", "label": "EST. CAP. INVESTMENT", "width": 0.069},
            ]

            s_headings, styles, filtered_cells = report._get_other_section_meta_data(
                "PROJECT BACKGROUND", cells, cell_index=0
            )

            assert len(filtered_cells) == 1
            assert filtered_cells[0]["data_key"] == "work_title"


class TestEAResourceForeCastReportGenerateReport:
    """Test generate_report method - integration tests."""

    def test_generate_report_json_empty_data(self, app, db):
        """Test generating report with JSON return type when no data."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report_date = datetime(2024, 1, 15, tzinfo=CANADA_TIMEZONE)

            result, filename = report.generate_report(
                report_date, return_type="json", include_first_phase=False
            )

            # With no data in DB, should return empty
            assert result == {}
            assert filename is None


class TestReportsEndpoint:
    """Test reports API endpoint."""

    def test_post_reports_unauthorized(self, client):
        """Test that reports endpoint requires authentication."""
        url = urljoin(API_BASE_URL, "reports/ea-resource-forecast")
        result = client.post(url, json={"report_date": "2024-01-01"})
        # Should return 401 unauthorized without auth header
        assert result.status_code in [HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN]


class TestEAResourceForeCastReportSortDataByWorkType:
    """Test _sort_data_by_work_type method."""

    def test_sort_data_by_work_type_assessment(self, app):
        """Test sorting assessment work type data."""
        with app.app_context():
            from api.models.work_type import WorkTypeEnum
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            data = [
                {"work_id": 1, "work_type_id": WorkTypeEnum.ASSESSMENT.value, "work_title": "Zebra Project"},
                {"work_id": 2, "work_type_id": WorkTypeEnum.ASSESSMENT.value, "work_title": "Alpha Project"},
                {"work_id": 3, "work_type_id": WorkTypeEnum.AMENDMENT.value, "work_title": "Beta Project"},
            ]
            second_phases = [
                {"work_id": 1, "actual_date": None},
                {"work_id": 2, "actual_date": datetime(2024, 1, 15)},
            ]

            with patch.object(
                report, '_find_work_second_phase',
                side_effect=lambda p, wid: next(
                    (sp for sp in second_phases if sp["work_id"] == wid),
                    {"actual_date": None}
                )
            ):
                result = report._sort_data_by_work_type(data, WorkTypeEnum.ASSESSMENT.value, second_phases)

            assert len(result) == 2
            # High priority (with actual_date) should come first
            assert result[0]["work_id"] == 2

    def test_sort_data_by_work_type_non_assessment(self, app):
        """Test sorting non-assessment work type data."""
        with app.app_context():
            from api.models.work_type import WorkTypeEnum
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            data = [
                {"work_id": 1, "work_type_id": WorkTypeEnum.AMENDMENT.value, "work_title": "Zebra Amendment"},
                {"work_id": 2, "work_type_id": WorkTypeEnum.AMENDMENT.value, "work_title": "Alpha Amendment"},
                {"work_id": 3, "work_type_id": WorkTypeEnum.ASSESSMENT.value, "work_title": "Beta Project"},
            ]

            result = report._sort_data_by_work_type(data, WorkTypeEnum.AMENDMENT.value)

            assert len(result) == 2
            # Should be alphabetically sorted
            assert result[0]["work_title"] == "Alpha Amendment"
            assert result[1]["work_title"] == "Zebra Amendment"


class TestEAResourceForeCastReportFindWorkSecondPhase:
    """Test _find_work_second_phase method."""

    def test_find_work_second_phase_found(self, app):
        """Test finding second phase for a work."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            mock_work_phase = MagicMock()
            mock_work_phase.work_id = 1
            second_phases = [{"work_phase": mock_work_phase, "actual_date": datetime(2024, 1, 15)}]

            result = report._find_work_second_phase(second_phases, 1)

            assert result["actual_date"] == datetime(2024, 1, 15)

    def test_find_work_second_phase_not_found(self, app):
        """Test finding second phase when work not found."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            mock_work_phase = MagicMock()
            mock_work_phase.work_id = 2
            second_phases = [{"work_phase": mock_work_phase, "actual_date": datetime(2024, 1, 15)}]

            result = report._find_work_second_phase(second_phases, 1)

            assert result is None


class TestEAResourceForeCastReportIsSecondWorkPhase:
    """Test _is_second_work_phase method."""

    def test_is_second_work_phase_true(self, app):
        """Test when event is in second work phase."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            mock_event = MagicMock()
            mock_event.work_id = 1
            mock_event.event_configuration.work_phase_id = 10

            mock_work_phase1 = MagicMock()
            mock_work_phase1.id = 5
            mock_work_phase1.sort_order = 1

            mock_work_phase2 = MagicMock()
            mock_work_phase2.id = 10
            mock_work_phase2.sort_order = 2

            # work_phases is keyed by work_id, value is list of phases
            work_phases = {1: [mock_work_phase1, mock_work_phase2]}

            result = report._is_second_work_phase(mock_event, work_phases)

            assert result is True

    def test_is_second_work_phase_false(self, app):
        """Test when event is not in second work phase."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            mock_event = MagicMock()
            mock_event.work_id = 1
            mock_event.event_configuration.work_phase_id = 5

            mock_work_phase1 = MagicMock()
            mock_work_phase1.id = 5
            mock_work_phase1.sort_order = 1

            mock_work_phase2 = MagicMock()
            mock_work_phase2.id = 10
            mock_work_phase2.sort_order = 2

            # work_phases is keyed by work_id, value is list of phases
            work_phases = {1: [mock_work_phase1, mock_work_phase2]}

            result = report._is_second_work_phase(mock_event, work_phases)

            assert result is False


class TestEAResourceForeCastReportHandleMonths:
    """Test _handle_months method."""

    def test_handle_months_with_referral(self, app):
        """Test handling months with referral date."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report.month_labels = ["February", "March", "April", "May, Jun"]

            work_data = {
                "work_id": 1,
                "February": "Phase 1",
                "February_color": "#FF0000",
                "March": "Phase 2",
                "March_color": "#00FF00",
                "April": "Phase 3",
                "April_color": "#0000FF",
                "May, Jun": "Phase 4",
                "May, Jun_color": "#FFFF00",
            }

            with patch.object(report, '_get_referral_timing', return_value=datetime(2024, 3, 15)):
                result = report._handle_months(work_data)

            assert result["referral_timing"] == "2024-03-15"
            assert "months" in result
            assert len(result["months"]) == 4

    def test_handle_months_no_referral(self, app):
        """Test handling months without referral date."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)
            report.month_labels = ["February", "March", "April", "May, Jun"]

            work_data = {
                "work_id": 1,
                "February": "Phase 1",
                "February_color": "#FF0000",
                "March": "Phase 2",
                "March_color": "#00FF00",
                "April": "Phase 3",
                "April_color": "#0000FF",
                "May, Jun": "Phase 4",
                "May, Jun_color": "#FFFF00",
            }

            with patch.object(report, '_get_referral_timing', return_value=None):
                result = report._handle_months(work_data)

            assert result["referral_timing"] is None


class TestEAResourceForeCastReportSortData:
    """Test _sort_data method."""

    def test_sort_data_multiple_types(self, app):
        """Test sorting data with multiple work types."""
        with app.app_context():
            from api.models.work_type import WorkTypeEnum
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            data = [
                {"work_id": 1, "work_type_id": WorkTypeEnum.AMENDMENT.value, "work_title": "Amendment 1"},
                {"work_id": 2, "work_type_id": WorkTypeEnum.ASSESSMENT.value, "work_title": "Assessment 1"},
                {"work_id": 3, "work_type_id": WorkTypeEnum.EXEMPTION_ORDER.value, "work_title": "Exemption 1"},
            ]
            second_phases = []

            with patch.object(report, '_find_work_second_phase', return_value={"actual_date": None}):
                result = report._sort_data(data, second_phases)

            # Should have all 3 items
            assert len(result) == 3
            # Assessments should come first
            assert result[0]["work_type_id"] == WorkTypeEnum.ASSESSMENT.value


class TestEAResourceForeCastReportGetStyles:
    """Test _get_styles method."""

    def test_get_styles_returns_styles(self, app):
        """Test that _get_styles returns valid style objects."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            with patch('api.reports.resource_forecast_report.pdfmetrics.registerFont'):
                with patch('api.reports.resource_forecast_report.TTFont'):
                    normal_style, heading_style = report._get_styles()

            assert normal_style is not None
            assert heading_style is not None


class TestEAResourceForeCastReportUpdateSpecialHistory:
    """Test _update_special_history method."""

    def test_update_special_history_with_histories(self, app):
        """Test updating work data with special histories."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            work_data = {
                1: [{"work_id": 1, "project_name": "Test Project"}],
            }

            # Create mock special history objects
            mock_history = MagicMock()
            mock_history.SpecialField.entity_id = 1
            mock_history.SpecialField.field_name = "responsible_epd_id"
            mock_history.staff_name = "EPD Name"

            special_histories = [mock_history]

            result = report._update_special_history(work_data, special_histories)

            assert 1 in result
            assert result[1][0]["responsible_epd"] == "EPD Name"

    def test_update_special_history_empty_histories(self, app):
        """Test updating work data with empty special histories."""
        with app.app_context():
            report = EAResourceForeCastReport(filters=None, color_intensity=50)

            work_data = {
                1: [{"work_id": 1, "project_name": "Test Project"}],
            }
            special_histories = []

            result = report._update_special_history(work_data, special_histories)

            assert 1 in result
