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
from typing import IO, Dict
import pandas as pd
from reports_api.exceptions import BadRequestError
from reports_api import models
from reports_api.utils.str import escape_characters
from reports_api.models import EventTemplate
from reports_api.schemas import request as req, response as res


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
        work_types, ea_acts, event_types, event_categories = cls._get_event_configuration_lookup_entities()
        event_dict = excel_dict.get("Events")
        phase_dict = excel_dict.get("Phases")
        for event_type in event_types:
            event_dict = event_dict.replace({'event_type_id': rf'^{event_type.name}$'},
                                            {'event_type_id': event_type.id}, regex=True)
        for event_category in event_categories:
            event_dict = event_dict.replace({'event_category_id': rf'^{event_category.name}$'},
                                            {'event_category_id': event_category.id}, regex=True)
        for work_type in work_types:
            phase_dict = phase_dict.replace({'work_type_id': rf'^{work_type.name}$'},
                                            {'work_type_id': work_type.id}, regex=True)
        for ea_act in ea_acts:
            name = escape_characters(ea_act.name, ['(', ')'])
            phase_dict = phase_dict.replace({'ea_act_id': rf'^{name}$'},
                                            {'ea_act_id': ea_act.id}, regex=True)

        event_dict = event_dict.to_dict('records')
        phase_dict = phase_dict.to_dict('records')

        phases_per_wt_ea_act_dict = {}
        events_per_phase = {}
        for phase in phase_dict:
            phases_key = str(phase['ea_act_id']) + str(phase['work_type_id'])
            if phases_key in phases_per_wt_ea_act_dict:
                existing_phases = phases_per_wt_ea_act_dict[phases_key]
            else:
                existing_phases = models.PhaseCode.find_by_ea_act_and_work_type(
                    phase['ea_act_id'], phase['work_type_id'])
                phases_per_wt_ea_act_dict[phases_key] = existing_phases
            phase_id = None
            phase_no = phase['no']
            del phase['no']
            selected_phase = next((p for p in existing_phases if p.name == phase['name']), None)
            phase_obj = req.PhaseBodyParameterSchema().load(phase)
            if selected_phase:
                phase_result = selected_phase.update(phase_obj)
            else:
                phase_result = models.PhaseCode(**phase_obj).save()
            phase_id = phase_result.id

            phase_result_copy = res.PhaseResponseSchema().dump(phase_result)
            phase_result_copy['events'] = []
            parent_events = list(filter(lambda x, _phase_no=phase_no: 'phase_no'
                                        in x and x['phase_no'] == _phase_no and not x['parent_id'], event_dict))
            for event in parent_events:
                event['phase_id'] = phase_id
                event['start_at'] = str(event['start_at'])
                event_result = cls._save_event_template(events_per_phase, event, phase_id)
                (phase_result_copy['events']).append(res.EventTemplateResponseSchema().dump(event_result))
                child_events = list(filter(lambda x, _parent_id=event['no']: 'parent_id'
                                           in x and x['parent_id'] == _parent_id, event_dict))
                for child in child_events:
                    child['phase_id'] = phase_id
                    child['parent_id'] = event_result.id
                    child['start_at'] = str(child['start_at'])
                    child_event_result = cls._save_event_template(events_per_phase, child, phase_id, event_result.id)
                    (phase_result_copy['events']).append(res.EventTemplateResponseSchema().dump(child_event_result))
            final_result.append(phase_result_copy)
        return final_result

    @classmethod
    def _save_event_template(cls, events_per_phase, event, phase_id, parent_id=None) -> EventTemplate:
        """Save the event templateI"""
        if phase_id in events_per_phase:
            existing_events = events_per_phase[phase_id]
        else:
            existing_events = models.EventTemplate.find_by_phase_id(phase_id)
            events_per_phase[phase_id] = existing_events
        selected_event = next((e for e in existing_events if e.name == event['name'] and
                               e.phase_id == phase_id and
                               (e.parent_id == parent_id) and
                               e.event_type_id == event['event_type_id'] and
                               e.event_category_id == event['event_category_id']), None)
        event_obj = req.EventTemplateBodyParameterSchema().load(event)
        if selected_event:
            event_result = selected_event.update(event_obj)
        else:
            event_result = models.EventTemplate(**event_obj).save()
        return event_result

    @classmethod
    def _read_excel(cls, configuration_file: IO) -> Dict[str, pd.DataFrame]:
        """Read the excel and return the data frame"""
        result = {}
        sheets = ['Phases', 'Events']
        sheet_obj_map = {
            'phases': {
                'No': 'no',
                'Name': 'name',
                'WorkType': 'work_type_id',
                'EAAct': 'ea_act_id',
                'NumberOfDays': 'number_of_days',
                'Color': 'color',
                'SortOrder': 'sort_order',
                'Legislated': 'legislated'
            },
            'events': {
                'No': 'no',
                'Parent': 'parent_id',
                'PhaseNo': 'phase_no',
                'EventName': 'name',
                'Phase': 'phase_id',
                'EventType': 'event_type_id',
                'EventCategory': 'event_category_id',
                'NumberOfDays': 'number_of_days',
                'StartAt': 'start_at',
                'Mandatory': 'mandatory',
                'SortOrder': 'sort_order'
            }
        }
        try:
            excel_dict = pd.read_excel(configuration_file, sheets, na_filter=False)
            phase_dict = pd.DataFrame(excel_dict.get("Phases"))
            phase_dict.rename(sheet_obj_map["phases"], axis='columns', inplace=True)
            event_dict = pd.DataFrame(excel_dict.get("Events"))
            event_dict.rename(sheet_obj_map["events"], axis='columns', inplace=True)
            result["Phases"] = phase_dict
            result["Events"] = event_dict
        except ValueError as exc:
            raise BadRequestError('Sheets missing in the imported excel.\
                                    Required sheets are [' + ','.join(sheets) + ']') from exc
        return result

    @classmethod
    def _get_event_configuration_lookup_entities(cls):
        """Returns the look up entities required to create the event configurations"""
        work_types = models.WorkType.find_all()
        ea_acts = models.EAAct.find_all()
        event_types = models.EventType.find_all()
        event_categories = models.EventCategory.find_all()
        return work_types, ea_acts, event_types, event_categories

    @classmethod
    def find_mandatory_event_templates(cls, phase_id: int):
        """Get all the mandatory event templates"""
        templates = EventTemplate.query.filter_by(EventTemplate.phase_id == phase_id).all()
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
