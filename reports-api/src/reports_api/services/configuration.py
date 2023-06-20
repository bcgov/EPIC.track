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
"""Service to manage configurations."""
import pandas as pd
from reports_api.exceptions import BadRequestError
from reports_api import models


class ConfigurationService:
    # pylint: disable=too-many-locals,
    # pylint: disable=too-few-public-methods,
    # pylint: disable=too-many-branches, too-many-statements
    """Service to manage configurations"""

    @classmethod
    def import_events_configurations(cls, configuration_file):
        """Import event configurations in to database"""
        final_result = []
        excel_dict, sheet_obj_map = cls._read_excel(cls, configuration_file=configuration_file)
        work_types, ea_acts, event_types, event_categories = cls._get_event_configuration_lookup_entities(cls)
        events = []
        phases_per_wt_ea_act_dict = {}
        events_per_phase = {}
        for _, event in excel_dict.get('Events').iterrows():
            event_dict = {}
            for col in sheet_obj_map['events']:
                event_dict[sheet_obj_map['events'][col]] = event[col]
            try:
                event_dict['event_type_id'] = next((event_type.id for event_type in event_types
                                                    if event_type.name == event['EventType']))
            except StopIteration as exc:
                raise BadRequestError(f'{event["EventType"]} not found the available event types') from exc
            try:
                event_dict['event_category_id'] = next((event_category.id for event_category in event_categories
                                                        if event_category.name == event['EventCategory']))
            except StopIteration as exc:
                raise BadRequestError(f'{event["EventCategory"]} not found the available event categories') from exc
            events.append(event_dict)
        for _, phase in excel_dict.get('Phases').iterrows():
            phase_dict = {}
            for col in sheet_obj_map['phases']:
                phase_dict[sheet_obj_map['phases'][col]] = phase[col]
            try:
                phase_dict['work_type_id'] = next((work_type.id for work_type in work_types
                                                   if work_type.name == phase['WorkType']))
            except StopIteration as exc:
                raise BadRequestError(f'{phase["WorkType"]} not found the available work types') from exc
            try:
                phase_dict['ea_act_id'] = next((ea_act.id for ea_act in ea_acts
                                                if ea_act.name == phase['EAAct']))
            except StopIteration as exc:
                raise BadRequestError(f'{phase["EAAct"]} not found the available EA Acts') from exc
            phases_key = str(phase_dict['ea_act_id']) + str(phase_dict['work_type_id'])
            if phases_key in phases_per_wt_ea_act_dict:
                existing_phases = phases_per_wt_ea_act_dict[phases_key]
            else:
                existing_phases = models.PhaseCode.find_by_ea_act_and_work_type(
                    phase_dict['ea_act_id'], phase_dict['work_type_id'])
                phases_per_wt_ea_act_dict[phases_key] = existing_phases
            phase_id = None
            phase_no = phase_dict['no']
            del phase_dict['no']
            selected_phase = next((p for p in existing_phases if p.name == phase_dict['name']), None)
            if selected_phase:
                phase_result = selected_phase.update(phase_dict)
            else:
                phase_result = models.PhaseCode(**phase_dict).save()
            phase_id = phase_result.id

            phase_result_copy = phase_result.as_dict()
            phase_result_copy['events'] = []
            filtered_events = list(filter(lambda x, _phase_no=phase_no: 'phase_no'
                                          in x and x['phase_no'] == _phase_no, events))
            for event in filtered_events:
                event['phase_id'] = phase_result.id
                del event['phase_no']
                del event['no']
                if phase_result.id in events_per_phase:
                    existing_events = events_per_phase[phase_result.id]
                else:
                    existing_events = models.EventTemplate.find_by_phase_id(phase_id)
                    events_per_phase[phase_id] = existing_events
                selected_event = next((e for e in existing_events if e.name == event['name'] and
                                       e.event_type_id == event['event_type_id'] and
                                       e.event_category_id == event['event_category_id']), None)
                if selected_event:
                    event_result = selected_event.update(event)
                else:
                    event_result = models.EventTemplate(**event).save()
                (phase_result_copy['events']).append(event_result.as_dict(recursive=False))
            final_result.append(phase_result_copy)
        return final_result

    def _read_excel(self, configuration_file):
        """Read the excel and return the data frame"""
        sheets = ['Phases', 'Events']
        sheet_obj_map = {
            'phases': {
                'No': 'no',
                'Name': 'name',
                'WorkType': 'work_type_id',
                'EAAct': 'ea_act_id',
                'NumberOfDays': 'duration',
                'Color': 'color',
                'SortOrder': 'sort_order',
                'Legislated': 'legislated'
            },
            'events': {
                'No': 'no',
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
            excel_dict = pd.read_excel(configuration_file, sheets)
        except ValueError as exc:
            raise BadRequestError('Sheets missing in the imported excel.\
                                    Required sheets are [' + ','.join(sheets) + ']') from exc
        return excel_dict, sheet_obj_map

    def _get_event_configuration_lookup_entities(self):
        """Returns the look up entities required to create the event configurations"""
        work_types = models.WorkType.find_all()
        ea_acts = models.EAAct.find_all()
        event_types = models.EventType.find_all()
        event_categories = models.EventCategory.find_all()
        return work_types, ea_acts, event_types, event_categories
