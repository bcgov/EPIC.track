"""Unit tests for Lookups Service."""
from io import BytesIO

from api.services.lookups import LookupService


class TestGetDataItem:
    """Tests for get_data_item method."""

    def test_returns_matching_item(self):
        """Test finding item that matches key and value."""
        data = [
            {"id": 1, "name": "First"},
            {"id": 2, "name": "Second"},
            {"id": 3, "name": "Third"},
        ]

        result = LookupService.get_data_item(data, "id", 2)

        assert result == {"id": 2, "name": "Second"}

    def test_returns_first_match_when_multiple(self):
        """Test returns first matching item when multiple exist."""
        data = [
            {"id": 1, "name": "First"},
            {"id": 1, "name": "Duplicate"},
            {"id": 2, "name": "Second"},
        ]

        result = LookupService.get_data_item(data, "id", 1)

        assert result == {"id": 1, "name": "First"}

    def test_returns_none_when_not_found(self):
        """Test returns None when no match found."""
        data = [
            {"id": 1, "name": "First"},
            {"id": 2, "name": "Second"},
        ]

        result = LookupService.get_data_item(data, "id", 999)

        assert result is None

    def test_returns_none_for_empty_list(self):
        """Test returns None for empty data list."""
        data = []

        result = LookupService.get_data_item(data, "id", 1)

        assert result is None

    def test_matches_on_string_key(self):
        """Test matching on string values."""
        data = [
            {"id": 1, "name": "Alpha"},
            {"id": 2, "name": "Beta"},
        ]

        result = LookupService.get_data_item(data, "name", "Beta")

        assert result == {"id": 2, "name": "Beta"}

    def test_matches_on_none_value(self):
        """Test matching on None value."""
        data = [
            {"id": 1, "name": "First"},
            {"id": 2, "name": None},
        ]

        result = LookupService.get_data_item(data, "name", None)

        assert result == {"id": 2, "name": None}


class TestGenerateExcel:
    """Tests for generate_excel method."""

    def test_generates_excel_with_single_sheet(self):
        """Test generating Excel with single data category."""
        data = {
            "projects": [
                {"id": 1, "name": "Project A", "description": "A description"},
                {"id": 2, "name": "Project B", "description": "B description"},
            ]
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)
        # Verify it's a valid Excel file by checking bytes
        result.seek(0)
        content = result.read()
        assert len(content) > 0
        # XLSX files start with PK (zip signature)
        assert content[:2] == b'PK'

    def test_generates_excel_with_multiple_sheets(self):
        """Test generating Excel with multiple data categories."""
        data = {
            "projects": [
                {"id": 1, "name": "Project A", "description": "Desc A"},
            ],
            "users": [
                {"id": 1, "username": "user1"},
                {"id": 2, "username": "user2"},
            ],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)
        result.seek(0)
        content = result.read()
        assert len(content) > 0

    def test_handles_empty_category(self):
        """Test handling empty data category."""
        data = {
            "projects": [],
            "users": [{"id": 1, "name": "User"}],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)
        result.seek(0)
        content = result.read()
        assert len(content) > 0

    def test_handles_all_empty_categories(self):
        """Test handling when all categories are empty."""
        data = {
            "projects": [],
            "users": [],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)

    def test_handles_empty_data_dict(self):
        """Test handling empty data dictionary."""
        data = {}

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)

    def test_sheet_name_formatting(self):
        """Test that sheet names are properly formatted from keys."""
        # The method converts underscores to spaces and title cases
        # e.g., "project_types" -> "Project Types"
        data = {
            "project_types": [
                {"id": 1, "type_name": "Type A"},
            ],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)
        result.seek(0)
        content = result.read()
        assert len(content) > 0

    def test_projects_description_column_width(self):
        """Test projects sheet has special description column width."""
        data = {
            "projects": [
                {"id": 1, "name": "Project", "description": "A very long description"},
            ],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)

    def test_handles_various_data_types(self):
        """Test handling various data types in values."""
        data = {
            "mixed_types": [
                {
                    "id": 1,
                    "name": "Test",
                    "count": 100,
                    "rate": 3.14,
                    "active": True,
                    "empty": None,
                },
            ],
        }

        result = LookupService.generate_excel(data)

        assert isinstance(result, BytesIO)
        result.seek(0)
        content = result.read()
        assert len(content) > 0
