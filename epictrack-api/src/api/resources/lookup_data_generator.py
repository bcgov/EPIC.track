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
"""Resource for inspection endpoints."""
import os

from flask import send_file
from flask_restx import Namespace, Resource, cors

from api.services import CodeService, LookupService, ProjectService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace('lookups', description='Lookups')


@cors_preflight('GET')
@API.route('', methods=['GET', 'OPTIONS'])
class Inspections(Resource):
    """Endpoint resource to return number of inspections."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    @profiletime
    def get():  # pylint: disable=too-many-locals
        """Return total number of inspections."""
        positions = CodeService.find_code_values_by_type('positions')
        staffs = CodeService.find_code_values_by_type('staffs')
        indigenous_nations = CodeService.find_code_values_by_type('indigenous_nations')
        indigenous_categories = CodeService.find_code_values_by_type('indigenous_categories')
        roles = CodeService.find_code_values_by_type('roles')
        ea_acts = CodeService.find_code_values_by_type('ea_acts')
        work_types = CodeService.find_code_values_by_type('work_types')
        projects = ProjectService.find_all()
        ministries = CodeService.find_code_values_by_type('ministries')
        federal_involvements = CodeService.find_code_values_by_type('federal_involvements')
        phases = CodeService.find_code_values_by_type('phase_codes')
        milestones = CodeService.find_code_values_by_type('milestones')
        outcomes = CodeService.find_code_values_by_type('outcomes')
        teams = CodeService.find_code_values_by_type('eao_teams')
        regions = CodeService.find_code_values_by_type('regions')
        types = CodeService.find_code_values_by_type('types')
        sub_types = CodeService.find_code_values_by_type('sub_types')
        proponents = CodeService.find_code_values_by_type('proponents')

        data = {}

        data['indigenous_nations'] = [{'id': x['id'], 'name': x['name']} for x in indigenous_nations['codes']]
        data['indigenous_categories'] = [{'id': x['id'], 'name': x['name']} for x in indigenous_categories['codes']]
        data['positions'] = [{'id': x['id'], 'name': x['name']} for x in positions['codes']]
        data['roles'] = [{'id': x['id'], 'name': x['name']} for x in roles['codes']]
        data['ea_acts'] = [{'id': x['id'], 'name': x['name']} for x in ea_acts['codes']]
        data['work_types'] = [{'id': x['id'], 'name': x['name']} for x in work_types['codes']]
        data['federal_involvements'] = [{'id': x['id'], 'name': x['name']} for x in federal_involvements['codes']]
        data['teams'] = [{'id': x['id'], 'name': x['name']} for x in teams['codes']]
        data['ministries'] = [{'id': x['id'], 'name': x['name'], 'abbreviation': x['abbreviation']}
                              for x in ministries['codes']]
        data['phases'] = [{'id': x['id'], 'name': x['name'], 'duration': x['duration'],
                           'work_type': x['work_type']['name'], 'ea_act': x['ea_act']['name']} for x in phases['codes']]
        data['milestones'] = [{'id': x['id'], 'name': x['name'], 'duration': x['duration'], 'start_at': x['start_at'],
                               'kind': x['kind'], 'auto': x['auto'], 'milestone_type': x['milestone_type']['name'],
                               'phase_name': LookupService.get_data_item(phases['codes'], 'id', x['phase_id'])['name']}
                              for x in milestones['codes']]
        data['outcomes'] = [{'id': x['id'], 'name': x['name'], 'terminates_work': x['terminates_work'],
                             'milestone': LookupService.get_data_item(
                            milestones['codes'], 'id', x['milestone_id'])['name']} for x in outcomes['codes']]
        data['staffs'] = [{'id': x['id'], 'first_name': x['first_name'], 'last_name': x['last_name'],
                           'email': x['email'], 'phone': x['phone'],
                           'position': x['position']['name']} for x in staffs['codes']]
        data['projects'] = [{'id': x['id'], 'name': x['name'], 'location': x['location'],
                             'description': x['description'], 'address': x['address'],
                             'proponent_name': x['proponent']['name'], 'sub_type_name': x['sub_type']['name']}
                            for x in projects['projects']]
        data['regions'] = [{'id': x['id'], 'name': x['name'], 'entity': x['entity']} for x in regions['codes']]
        data['types'] = [{'id': x['id'], 'name': x['name'], 'short_name': x['short_name']} for x in types['codes']]
        data['sub_types'] = [{'id': x['id'], 'name': x['name'], 'short_name': x['short_name'],
                             'types': x['type']['name']} for x in sub_types['codes']]
        data['proponents'] = [{'id': x['id'], 'name': x['name']} for x in proponents['codes']]

        lookup_data = LookupService.generate_excel(data)

        return send_file(lookup_data, as_attachment=True,
                         download_name=f'Lookups_{os.getenv("FLASK_ENV", "production")}.xlsx')
