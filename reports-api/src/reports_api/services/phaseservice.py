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
"""Service to manage Phase."""
from flask import current_app, jsonify

from reports_api.models.phase_code import PhaseCode


class PhaseService():  # pylint:disable=too-few-public-methods
    """Service to manage phases related operations"""

    @classmethod
    def find_phase_codes_by_ea_act_and_work_type(
            cls,
            _ea_act_id: str,
            _work_type_id: str
    ):
        """Find phase codes by ea_act and work_type"""
        current_app.logger.debug(f'<find_phase_codes_by_ea_act_and_work_type : {_ea_act_id} - {_work_type_id}')
        code_table = PhaseCode.find_by_ea_act_and_work_type(_ea_act_id, _work_type_id)
        return jsonify([item.as_dict() for item in code_table])
