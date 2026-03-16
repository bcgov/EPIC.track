"""Unit tests for Action Template Service."""
from unittest.mock import MagicMock, patch

from api.services.action_template import ActionTemplateService
from api.models.action import ActionEnum


class TestGetActionParams:
    """Tests for get_action_params method."""

    def test_returns_request_data_for_add_event(self):
        """Test returning request data for ADD_EVENT action."""
        action_type = ActionEnum.ADD_EVENT
        request_data = {
            "event_name": "New Event",
            "phase_name": "Phase 1",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        result = ActionTemplateService.get_action_params(action_type, request_data)

        assert result == request_data

    def test_returns_request_data_for_other_actions(self):
        """Test returning request data for non-ADD_EVENT actions."""
        # Create a mock action type that's not ADD_EVENT
        other_action = MagicMock()
        other_action.__eq__ = lambda self, other: False

        request_data = {"param1": "value1", "param2": "value2"}

        result = ActionTemplateService.get_action_params(other_action, request_data)

        assert result == request_data

    def test_add_event_preserves_all_fields(self):
        """Test ADD_EVENT action preserves all request fields."""
        action_type = ActionEnum.ADD_EVENT
        request_data = {
            "event_name": "Test Event",
            "phase_name": "Test Phase",
            "work_type_id": 5,
            "ea_act_id": 3,
            "description": "Test description",
            "extra_field": "extra_value",
        }

        result = ActionTemplateService.get_action_params(action_type, request_data)

        assert result == request_data
        assert "event_name" in result
        assert "extra_field" in result

    def test_handles_empty_request_data(self):
        """Test handling empty request data."""
        action_type = ActionEnum.ADD_EVENT
        request_data = {}

        result = ActionTemplateService.get_action_params(action_type, request_data)

        assert result == {}


class TestGetPhaseParam:
    """Tests for _get_phase_param private method."""

    @patch("api.services.action_template.PhaseCode")
    def test_returns_phase_id_when_found(self, mock_phase_code):
        """Test returning phase_id when phase is found."""
        request_data = {
            "phase_name": "Assessment",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        mock_phase = MagicMock(id=10)
        mock_phase_code.find_by_params.return_value = [mock_phase]

        result = ActionTemplateService._get_phase_param(request_data)

        assert result == {"phase_id": 10}
        mock_phase_code.find_by_params.assert_called_once_with({
            "name": "Assessment",
            "work_type_id": 1,
            "ea_act_id": 2,
        })

    @patch("api.services.action_template.PhaseCode")
    def test_returns_empty_dict_when_not_found(self, mock_phase_code):
        """Test returning empty dict when phase not found."""
        request_data = {
            "phase_name": "NonExistent",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        mock_phase_code.find_by_params.return_value = []

        result = ActionTemplateService._get_phase_param(request_data)

        assert result == {}

    @patch("api.services.action_template.PhaseCode")
    def test_returns_empty_dict_when_none_result(self, mock_phase_code):
        """Test returning empty dict when find returns None."""
        request_data = {
            "phase_name": "Missing",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        mock_phase_code.find_by_params.return_value = None

        result = ActionTemplateService._get_phase_param(request_data)

        assert result == {}

    @patch("api.services.action_template.PhaseCode")
    def test_strips_phase_name_whitespace(self, mock_phase_code):
        """Test stripping whitespace from phase name."""
        request_data = {
            "phase_name": "  Assessment  ",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        mock_phase = MagicMock(id=5)
        mock_phase_code.find_by_params.return_value = [mock_phase]

        ActionTemplateService._get_phase_param(request_data)

        expected_param = {
            "name": "Assessment",
            "work_type_id": 1,
            "ea_act_id": 2,
        }
        mock_phase_code.find_by_params.assert_called_once_with(expected_param)

    @patch("api.services.action_template.PhaseCode")
    def test_returns_first_phase_when_multiple(self, mock_phase_code):
        """Test returning first phase ID when multiple phases match."""
        request_data = {
            "phase_name": "Common Phase",
            "work_type_id": 1,
            "ea_act_id": 2,
        }

        mock_phase1 = MagicMock(id=10)
        mock_phase2 = MagicMock(id=20)
        mock_phase_code.find_by_params.return_value = [mock_phase1, mock_phase2]

        result = ActionTemplateService._get_phase_param(request_data)

        assert result == {"phase_id": 10}

    @patch("api.services.action_template.PhaseCode")
    def test_handles_none_values_in_request(self, mock_phase_code):
        """Test handling None values in request data."""
        request_data = {
            "phase_name": "Test",
            "work_type_id": None,
            "ea_act_id": None,
        }

        mock_phase_code.find_by_params.return_value = []

        result = ActionTemplateService._get_phase_param(request_data)

        assert result == {}
        mock_phase_code.find_by_params.assert_called_once_with({
            "name": "Test",
            "work_type_id": None,
            "ea_act_id": None,
        })
