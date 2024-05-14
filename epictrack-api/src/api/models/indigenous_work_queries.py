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
"""Model to handle complex queries related to Indigenous Work."""

from sqlalchemy.orm import joinedload

from api.models import db, IndigenousWork, Work


def find_all_by_project_id(project_id: int):
    """Return all Indigenous Work for a project."""
    query = (db.session.query(IndigenousWork)
             .join(Work, IndigenousWork.work_id == Work.id)
             .filter(Work.project_id == project_id)
             .options(joinedload(IndigenousWork.work))
             .distinct(Work.project_id, IndigenousWork.indigenous_nation_id)
             )
    return query.all()
