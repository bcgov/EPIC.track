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
"""Service to manage Action Template"""
from api.models.action import ActionEnum
from api.models.phase_code import PhaseCode


class ActionTemplateService:  # pylint: disable=too-few-public-methods
    """Service to manage action templates"""

    @classmethod
    def get_action_params(cls, action_type: ActionEnum, request_data: dict):
        """Return the action params for the template"""
        if action_type == ActionEnum.ADD_EVENT:
            return request_data  # cls._get_phase_param(request_data)
        return request_data

    @classmethod
    def _get_phase_param(cls, request_data: dict) -> dict:
        """Return the phase_id as dict"""
        param = {
            "name": request_data.get("phase_name").strip(),
            "work_type_id": request_data.get("work_type_id"),
            "ea_act_id": request_data.get("ea_act_id")
        }
        result = PhaseCode.find_by_params(param)
        if not result:
            return {}
        return {
            "phase_id": result[0].id
        }
