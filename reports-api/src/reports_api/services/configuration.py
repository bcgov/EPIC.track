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
from reports_api.exceptions import BadRequestError, BusinessError
import reports_api.models as models

class ConfigurationService:
    """Service to manage configurations"""

    @classmethod
    def import_events_configurations(cls, configuration_file):
        """Import event configurations in to database"""

        sheets = ['Phases', 'Events']
        sheet_obj_map = {
            'phases': {
                'No' : 'no',
                'Name' : 'name',
                'WorkType' : 'work_type_id',
                'EAAct' : 'ea_act_id',
                'NumberOfDays' : 'duration',
                'Color' : 'color',
                'SortOrder' : 'sort_order'
            },
            'events': {
                'No' : 'no',
                'PhaseNo' : 'phase_no',
                'EventName' : 'name',
                'Phase' : 'phase_id',
                'EventType' : 'event_type_id',
                'EventCategory' : 'event_category_id',
                'StartAt' : 'number_of_days',
                'Mandatory' : 'mandatory'
            }
        }
        excel_dict = None
        try:
            excel_dict = pd.read_excel(configuration_file, sheets)
        except Exception:
            raise BadRequestError('Sheets missing in the imported excel.\
                                    Required sheets are [' + ','.join(sheets) + ']')
        work_types = models.WorkType.find_all()
        ea_acts = models.EAAct.find_all()
        event_types = models.EventType.find_all()
        event_categories = models.EventCategory.find_all()
        phases = []
        events = []
        for _, phase in excel_dict.get('Phases').iterrows():
            phase_dict = {}
            for col in sheet_obj_map['phases']:
                phase_dict[sheet_obj_map['phases'][col]] = phase[col]
            try:
                phase_dict['work_type_id'] = next((work_type.id for work_type in work_types
                                                if work_type.name == phase['WorkType']), None)
            except Exception:
                raise BusinessError(f'{phase["WorkType"]} not found the available work types')
            try:
                phase_dict['ea_act_id'] = next((ea_act.id for ea_act in ea_acts
                                                if ea_act.name == phase['EAAct']), None)
            except Exception:
                raise BusinessError(f'{phase["EAAct"]} not found the available EA Acts')
            phases.append(models.PhaseCode(**phase_dict))
        for _, event in excel_dict.get('Events').iterrows():
            event_dict = {}
            for col in sheet_obj_map['events']:
                event_dict[sheet_obj_map['events'][col]] = event[col]
            try:
                event_dict['event_type_id'] = next((event_type.id for event_type in event_types
                                                if event_type.name == event['EventType']), None)
            except Exception:
                raise BusinessError(f'{event["EventType"]} not found the available event types')
            try:
                event_dict['event_category_id'] = next((event_category.id for event_category in event_categories
                                                if event_category.name == event['EventCategory']), None)
            except Exception:
                raise BusinessError(f'{event["EventCategory"]} not found the available event categories')


