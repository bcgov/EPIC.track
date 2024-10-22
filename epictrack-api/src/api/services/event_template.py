# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Event Template."""
import copy
import json
from typing import IO, Dict

import pandas as pd

from api.exceptions import BadRequestError
from api.models import (
    Action,
    ActionTemplate,
    EAAct,
    EventCategory,
    EventTemplate,
    EventType,
    OutcomeTemplate,
    PhaseCode,
    WorkType,
    db,
)
from api.schemas import request as req
from api.schemas import response as res
from api.services.phaseservice import PhaseService
from api.utils.str import escape_characters


class EventTemplateService:
    # pylint: disable=too-many-locals,
    # pylint: disable=too-few-public-methods,
    # pylint: disable=too-many-branches, too-many-statements
    """Service to manage configurations"""

    @classmethod
    def import_events_template(cls, configuration_file):
        """Import event configurations in to database"""
        final_result = []
        excel_dict = cls._read_excel(configuration_file=configuration_file)
        (
            work_types,
            ea_acts,
            event_types,
            event_categories,
            actions,
        ) = cls._get_event_configuration_lookup_entities()
        event_dict = excel_dict.get("Events")
        phase_dict = excel_dict.get("Phases")
        outcome_dict = excel_dict.get("Outcomes")
        action_dict = excel_dict.get("Actions")
        for event_type in event_types:
            name = escape_characters(event_type.name, ["(", ")"])
            event_dict = event_dict.replace(
                {"event_type_id": rf"^{name}$"},
                {"event_type_id": event_type.id},
                regex=True,
            )
        for event_category in event_categories:
            name = escape_characters(event_category.name, ["(", ")"])
            event_dict = event_dict.replace(
                {"event_category_id": rf"^{name}$"},
                {"event_category_id": event_category.id},
                regex=True,
            )
        for work_type in work_types:
            name = escape_characters(work_type.name, ["(", ")"])
            phase_dict = phase_dict.replace(
                {"work_type_id": rf"^{name}$"},
                {"work_type_id": work_type.id},
                regex=True,
            )
        for ea_act in ea_acts:
            name = escape_characters(ea_act.name, ["(", ")"])
            phase_dict = phase_dict.replace(
                {"ea_act_id": rf"^{name}$"}, {"ea_act_id": ea_act.id}, regex=True
            )
        for action in actions:
            name = escape_characters(action.name, ["(", ")"])
            action_dict = action_dict.replace(
                {"action_id": rf"^{name}$"}, {"action_id": action.id}, regex=True
            )

        event_dict = event_dict.to_dict("records")
        phase_dict = phase_dict.to_dict("records")
        existing_phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(
            phase_dict[0]["ea_act_id"], phase_dict[0]["work_type_id"]
        )
        for phase in phase_dict:
            selected_phase = next(
                (p for p in existing_phases if p.name == phase["name"]), None
            )
            phase_obj = req.PhaseBodyParameterSchema().load(phase)
            if selected_phase:
                phase_result = selected_phase.update(phase_obj, commit=False)
            else:
                phase_result = PhaseCode(**phase_obj).flush()
            phase_result_copy = res.PhaseResponseSchema().dump(phase_result)
            phase_result_copy["events"] = []
            parent_events = copy.deepcopy(
                list(
                    filter(
                        lambda x, _phase_no=phase["no"]: "phase_no" in x
                        and x["phase_no"] == _phase_no
                        and not x["parent_id"],
                        event_dict,
                    )
                )
            )
            existing_events = EventTemplate.find_by_phase_id(phase_result.id)
            template_ids = list(map(lambda x: x.id, existing_events))
            existing_outcomes = OutcomeTemplate.find_by_template_ids(template_ids)
            outcome_ids = list(map(lambda x: x.id, existing_outcomes))
            existing_actions = ActionTemplate.find_by_outcome_ids(outcome_ids)
            for event in parent_events:
                event["phase_id"] = phase_result.id
                event["start_at"] = str(event["start_at"])
                event_result = cls._save_event_template(
                    existing_events, event, phase_result.id
                )
                child_events = copy.deepcopy(
                    list(
                        filter(
                            lambda x, _parent_id=event["no"]: "parent_id" in x
                            and x["parent_id"] == _parent_id,
                            event_dict,
                        )
                    )
                )
                outcome_dict.loc[
                    outcome_dict["template_no"] == event["no"], "event_template_id"
                ] = event_result.id
                outcome_results = cls._handle_outcomes(
                    outcome_dict,
                    existing_outcomes,
                    existing_actions,
                    action_dict,
                    event,
                )
                event_result_copy = res.EventTemplateResponseSchema().dump(event_result)
                event_result_copy["outcomes"] = outcome_results
                (phase_result_copy["events"]).append(event_result_copy)
                for child in child_events:
                    child["phase_id"] = phase_result.id
                    child["parent_id"] = event_result.id
                    child["start_at"] = str(child["start_at"])
                    child_event_result = cls._save_event_template(
                        existing_events, child, phase_result.id, event_result.id
                    )
                    outcome_dict.loc[
                        outcome_dict["template_no"] == child["no"], "event_template_id"
                    ] = child_event_result.id
                    outcome_results = cls._handle_outcomes(
                        outcome_dict,
                        existing_outcomes,
                        existing_actions,
                        action_dict,
                        child,
                    )
                    event_result_copy = res.EventTemplateResponseSchema().dump(
                        child_event_result
                    )
                    event_result_copy["outcomes"] = outcome_results
                    (phase_result_copy["events"]).append(event_result_copy)
                child_events = []
            final_result.append(phase_result_copy)
            cls._handle_deletion_templates(
                existing_events,
                existing_outcomes,
                existing_actions,
                final_result,
                phase_result.id,
            )
        # deletion of phases
        existing_set = set(list(map(lambda x: x.id, existing_phases)))
        incoming_set = set(list(map(lambda x: x["id"], final_result)))
        difference = list(existing_set.difference(incoming_set))
        db.session.query(PhaseCode).filter(PhaseCode.id.in_(difference)).update(
            {PhaseCode.is_active: False, PhaseCode.is_deleted: True}
        )
        # handling deletion of event templates, outcomes and actions of the deleted phases
        templates_from_removed_phases = db.session.query(EventTemplate).filter(
            EventTemplate.phase_id.in_(difference)
        )
        removed_template_ids = list(map(lambda x: x.id, templates_from_removed_phases))
        outcomes_from_removed_templates = db.session.query(OutcomeTemplate).filter(
            OutcomeTemplate.event_template_id.in_(removed_template_ids)
        )
        removed_outcome_ids = list(map(lambda x: x.id, outcomes_from_removed_templates))
        actions_from_removed_outcomes = db.session.query(ActionTemplate).filter(
            ActionTemplate.outcome_id.in_(removed_outcome_ids)
        )
        removed_action_ids = list(map(lambda x: x.id, actions_from_removed_outcomes))
        db.session.query(EventTemplate).filter(
            EventTemplate.id.in_(removed_template_ids)
        ).update({EventTemplate.is_active: False, EventTemplate.is_deleted: True})
        db.session.query(OutcomeTemplate).filter(
            OutcomeTemplate.id.in_(removed_outcome_ids)
        ).update({OutcomeTemplate.is_active: False, OutcomeTemplate.is_deleted: True})
        db.session.query(ActionTemplate).filter(
            ActionTemplate.id.in_(removed_action_ids)
        ).update({ActionTemplate.is_active: False, ActionTemplate.is_deleted: True})
        db.session.commit()
        return final_result

    @classmethod
    def _handle_deletion_templates(
        cls, existing_events, existing_outcomes, existing_actions, results, phase_id
    ):
        # pylint: disable=too-many-arguments
        """Handle deletion"""
        # events
        existing_set = set(list(map(lambda x: x.id, existing_events)))
        incoming_set = []
        incoming_outcome_set = []
        incoming_action_set = []
        for phase in results:
            event_list = copy.deepcopy(
                list(filter(lambda x: x["phase_id"] == phase_id, phase["events"]))
            )
            template_ids = list(map(lambda x: x["id"], event_list))
            incoming_set.extend(template_ids)
            for event in phase["events"]:
                incoming_outcome_set.extend(
                    list(map(lambda x: x["id"], event["outcomes"]))
                )
                for outcome in event["outcomes"]:
                    incoming_action_set.extend(
                        list(map(lambda x: x["id"], outcome["actions"]))
                    )
        difference = list(existing_set.difference(incoming_set))
        db.session.query(EventTemplate).filter(EventTemplate.id.in_(difference)).update(
            {EventTemplate.is_active: False, EventTemplate.is_deleted: False}
        )
        existing_outcome_set = set(list(map(lambda x: x.id, existing_outcomes)))
        difference = list(existing_outcome_set.difference(incoming_outcome_set))
        db.session.query(OutcomeTemplate).filter(
            OutcomeTemplate.id.in_(difference)
        ).update({OutcomeTemplate.is_active: False, OutcomeTemplate.is_deleted: False})
        existing_action_set = set(list(map(lambda x: x.id, existing_actions)))
        difference = list(existing_action_set.difference(incoming_action_set))
        db.session.query(ActionTemplate).filter(
            ActionTemplate.id.in_(difference)
        ).update({ActionTemplate.is_active: False, ActionTemplate.is_deleted: False})

    @classmethod
    def _handle_outcomes(
        cls, outcome_dict, existing_outcomes, existing_actions, action_dict, event
    ):
        # pylint: disable=too-many-arguments
        """Save the outcome"""
        outcome_list = copy.deepcopy(
            list(
                filter(
                    lambda x: x["template_no"] == event["no"],
                    outcome_dict.to_dict("records"),
                )
            )
        )
        outcome_final = []
        for outcome in outcome_list:
            selected_outcome = next(
                (
                    e
                    for e in existing_outcomes
                    if e.name == outcome["name"]
                    and e.event_template_id == outcome["event_template_id"]
                    and e.sort_order == outcome["sort_order"]
                ),
                None,
            )
            outcome_obj = req.OutcomeTemplateBodyParameterSchema().load(outcome)
            if selected_outcome:
                outcome_result = selected_outcome.update(outcome_obj, commit=False)
            else:
                outcome_result = OutcomeTemplate(**outcome_obj).flush()
            outcome_result_copy = res.OutcomeTemplateResponseSchema().dump(
                outcome_result
            )
            (outcome_result_copy["actions"]) = []
            action_dict.loc[
                action_dict["outcome_no"] == outcome["no"], "outcome_id"
            ] = outcome_result.id
            actions_list = copy.deepcopy(
                list(
                    filter(
                        lambda x, _outcome_no=outcome["no"]: x["outcome_no"]
                        == _outcome_no and x["action_id"] != "NONE",
                        action_dict.to_dict("records"),
                    )
                )
            )
            for action in actions_list:
                selected_action = next(
                    (
                        e
                        for e in existing_actions
                        if e.action_id == action["action_id"]
                        and e.outcome_id == action["outcome_id"]
                        and e.sort_order == action["sort_order"]
                    ),
                    None,
                )
                action["additional_params"] = json.loads(action["additional_params"])
                action_obj = req.ActionTemplateBodyParameterSchema().load(action)
                if selected_action:
                    action_result = selected_action.update(action_obj, commit=False)
                else:
                    action_result = ActionTemplate(**action_obj).flush()
                (outcome_result_copy["actions"]).append(
                    res.ActionTemplateResponseSchema().dump(action_result)
                )
            outcome_final.append(outcome_result_copy)
        return outcome_final

    @classmethod
    def _save_event_template(
        cls, existing_events, event, phase_id, parent_id=None
    ) -> EventTemplate:
        """Save the event templateI"""
        selected_event = next(
            (
                e
                for e in existing_events
                if e.name == event["name"]
                and e.phase_id == phase_id
                and (e.parent_id == parent_id)
                and e.event_type_id == event["event_type_id"]
                and e.event_category_id == event["event_category_id"]
            ),
            None,
        )
        event_obj = req.EventTemplateBodyParameterSchema().load(event)
        if selected_event:
            event_result = selected_event.update(event_obj, commit=False)
        else:
            event_result = EventTemplate(**event_obj).flush()
        return event_result

    @classmethod
    def _read_excel(cls, configuration_file: IO) -> Dict[str, pd.DataFrame]:
        """Read the excel and return the data frame"""
        result = {}
        sheets = ["Phases", "Events", "Outcomes", "Actions"]
        sheet_obj_map = {
            "phases": {
                "No": "no",
                "Name": "name",
                "WorkType": "work_type_id",
                "EAAct": "ea_act_id",
                "NumberOfDays": "number_of_days",
                "Color": "color",
                "SortOrder": "sort_order",
                "Legislated": "legislated",
                "Visibility": "visibility",
            },
            "events": {
                "No": "no",
                "Parent": "parent_id",
                "PhaseNo": "phase_no",
                "EventName": "name",
                "Phase": "phase_id",
                "EventType": "event_type_id",
                "EventCategory": "event_category_id",
                "EventPosition": "event_position",
                "MultipleDays": "multiple_days",
                "NumberOfDays": "number_of_days",
                "StartAt": "start_at",
                "Visibility": "visibility",
                "SortOrder": "sort_order",
            },
            "outcomes": {
                "No": "no",
                "TemplateNo": "template_no",
                "TemplateName": "event_template_id",
                "OutcomeName": "name",
                "SortOrder": "sort_order",
            },
            "actions": {
                "No": "no",
                "OutcomeNo": "outcome_no",
                "OutcomeName": "outcome_id",
                "ActionName": "action_id",
                "ActionDescription": "description",
                "AdditionalParams": "additional_params",
                "SortOrder": "sort_order",
            },
        }
        try:
            excel_dict = pd.read_excel(configuration_file, sheets, na_filter=False)
            phase_dict = pd.DataFrame(excel_dict.get("Phases"))
            phase_dict.rename(sheet_obj_map["phases"], axis="columns", inplace=True)
            event_dict = pd.DataFrame(excel_dict.get("Events"))
            event_dict.rename(sheet_obj_map["events"], axis="columns", inplace=True)
            outcome_dict = pd.DataFrame(excel_dict.get("Outcomes"))
            outcome_dict.rename(sheet_obj_map["outcomes"], axis="columns", inplace=True)
            action_dict = pd.DataFrame(excel_dict.get("Actions"))
            action_dict.rename(sheet_obj_map["actions"], axis="columns", inplace=True)
            result["Phases"] = phase_dict
            result["Events"] = event_dict
            result["Outcomes"] = outcome_dict
            result["Actions"] = action_dict
        except ValueError as exc:
            raise BadRequestError(
                "Sheets missing in the imported excel.\
                                    Required sheets are ["
                + ",".join(sheets)
                + "]"
            ) from exc
        return result

    @classmethod
    def _get_event_configuration_lookup_entities(cls):
        """Returns the look up entities required to create the event configurations"""
        work_types = WorkType.find_all()
        ea_acts = EAAct.find_all()
        event_types = EventType.find_all()
        event_categories = EventCategory.find_all()
        actions = Action.find_all()
        return work_types, ea_acts, event_types, event_categories, actions

    @classmethod
    def find_mandatory_event_templates(cls, phase_id: int):
        """Get all the mandatory event templates"""
        templates = EventTemplate.query.filter_by(
            EventTemplate.phase_id == phase_id
        ).all()
        return templates

    @classmethod
    def find_by_phase_id(cls, phase_id: int) -> [EventTemplate]:
        """Get event templates under given phase"""
        templates = EventTemplate.find_by_phase_id(phase_id)
        return templates

    @classmethod
    def find_by_phase_ids(cls, phase_ids: [int]) -> [EventTemplate]:
        """Get event templates under given phases"""
        templates = EventTemplate.find_by_phase_ids(phase_ids)
        return templates
