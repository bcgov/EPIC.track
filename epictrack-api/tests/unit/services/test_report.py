"""Unit tests for Report Service."""
from unittest.mock import MagicMock, patch
from io import BytesIO

from api.services.report import ReportService


class TestGenerateReport:
    """Tests for generate_report method."""

    @patch("api.services.report.get_report_generator")
    def test_generates_json_report(self, mock_get_generator):
        """Test generating JSON report."""
        report_type = "work_status"
        report_date = "2024-01-15"

        mock_generator = MagicMock()
        mock_report_data = {"data": [{"id": 1}, {"id": 2}]}
        mock_generator.generate_report.return_value = (mock_report_data, "report.json")
        mock_get_generator.return_value = mock_generator

        result = ReportService.generate_report(report_type, report_date, return_type="json")

        assert result == mock_report_data
        mock_get_generator.assert_called_once_with(report_type, None, None)
        mock_generator.generate_report.assert_called_once_with(report_date, "json", False)

    @patch("api.services.report.get_report_generator")
    def test_generates_excel_report(self, mock_get_generator):
        """Test generating Excel report."""
        report_type = "project_summary"
        report_date = "2024-01-15"

        mock_generator = MagicMock()
        mock_file = BytesIO(b"excel content")
        mock_generator.generate_report.return_value = (mock_file, "report.xlsx")
        mock_get_generator.return_value = mock_generator

        result, filename = ReportService.generate_report(
            report_type, report_date, return_type="xlsx"
        )

        assert result == mock_file
        assert filename == "report.xlsx"

    @patch("api.services.report.get_report_generator")
    def test_passes_filters_to_generator(self, mock_get_generator):
        """Test passing filters to report generator."""
        report_type = "work_status"
        report_date = "2024-01-15"
        filters = {"project_id": 1, "status": "active"}

        mock_generator = MagicMock()
        mock_generator.generate_report.return_value = ({}, "report.json")
        mock_get_generator.return_value = mock_generator

        ReportService.generate_report(report_type, report_date, filters=filters)

        mock_get_generator.assert_called_once_with(report_type, filters, None)

    @patch("api.services.report.get_report_generator")
    def test_passes_color_intensity(self, mock_get_generator):
        """Test passing color intensity to report generator."""
        report_type = "timeline"
        report_date = "2024-01-15"
        color_intensity = 0.8

        mock_generator = MagicMock()
        mock_generator.generate_report.return_value = ({}, "report.json")
        mock_get_generator.return_value = mock_generator

        ReportService.generate_report(
            report_type, report_date, color_intensity=color_intensity
        )

        mock_get_generator.assert_called_once_with(report_type, None, color_intensity)

    @patch("api.services.report.get_report_generator")
    def test_passes_include_first_phase_flag(self, mock_get_generator):
        """Test passing include_first_phase flag to generator."""
        report_type = "phase_report"
        report_date = "2024-01-15"

        mock_generator = MagicMock()
        mock_generator.generate_report.return_value = ({}, "report.json")
        mock_get_generator.return_value = mock_generator

        ReportService.generate_report(
            report_type, report_date, include_first_phase=True
        )

        mock_generator.generate_report.assert_called_once_with(report_date, "json", True)

    @patch("api.services.report.get_report_generator")
    def test_default_return_type_is_json(self, mock_get_generator):
        """Test default return type is JSON."""
        report_type = "summary"
        report_date = "2024-01-15"

        mock_generator = MagicMock()
        mock_report_data = {"summary": "data"}
        mock_generator.generate_report.return_value = (mock_report_data, "report.json")
        mock_get_generator.return_value = mock_generator

        result = ReportService.generate_report(report_type, report_date)

        # Should return just the data (no filename) for JSON
        assert result == mock_report_data
        mock_generator.generate_report.assert_called_once_with(report_date, "json", False)

    @patch("api.services.report.get_report_generator")
    def test_generates_pdf_report(self, mock_get_generator):
        """Test generating PDF report."""
        report_type = "detailed_report"
        report_date = "2024-01-15"

        mock_generator = MagicMock()
        mock_file = BytesIO(b"pdf content")
        mock_generator.generate_report.return_value = (mock_file, "report.pdf")
        mock_get_generator.return_value = mock_generator

        result, filename = ReportService.generate_report(
            report_type, report_date, return_type="pdf"
        )

        assert result == mock_file
        assert filename == "report.pdf"

    @patch("api.services.report.get_report_generator")
    def test_all_parameters_combined(self, mock_get_generator):
        """Test with all parameters provided."""
        report_type = "comprehensive"
        report_date = "2024-06-01"
        filters = {"region": "north", "year": 2024}
        color_intensity = 0.5

        mock_generator = MagicMock()
        mock_file = BytesIO(b"content")
        mock_generator.generate_report.return_value = (mock_file, "full_report.xlsx")
        mock_get_generator.return_value = mock_generator

        result, filename = ReportService.generate_report(
            report_type,
            report_date,
            return_type="xlsx",
            filters=filters,
            color_intensity=color_intensity,
            include_first_phase=True,
        )

        mock_get_generator.assert_called_once_with(report_type, filters, color_intensity)
        mock_generator.generate_report.assert_called_once_with(report_date, "xlsx", True)
        assert filename == "full_report.xlsx"
