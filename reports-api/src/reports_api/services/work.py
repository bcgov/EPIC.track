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
"""Service to manage Works."""

from flask import current_app

from reports_api.models import Work


class WorkService:
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, project_id, work_type_id):
        current_app.logger.info(f'project_id: {project_id}, work_type_id: {work_type_id}')
        if Work.query.filter_by(work_type_id=work_type_id, project_id=project_id).count() > 0:
            return {"exists": True}
        return {"exists": False}
