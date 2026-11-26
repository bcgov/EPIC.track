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
"""Reads work template versions."""
from typing import List, Tuple

from api.exceptions import ResourceNotFoundError
from api.models import WorkTemplate, WorkTemplateVersion
from api.workplan.core import template as tpl
from api.workplan.template_repository import TemplateRepository


class WorkTemplateService:
    """Work template versions."""

    @classmethod
    def find_all(cls) -> List[WorkTemplate]:
        """Return every work template, with its versions."""
        return WorkTemplate.query.order_by(WorkTemplate.work_type_id, WorkTemplate.ea_act_id).all()

    @classmethod
    def find_version(cls, template_id: int, version: int) -> Tuple[WorkTemplateVersion, tpl.Version]:
        """Return one version of a template, and its phases, milestones, outcomes and effects."""
        record = TemplateRepository.find(template_id, version)
        if record is None:
            raise ResourceNotFoundError(f"Work template {template_id} has no version {version}")
        return record, TemplateRepository.load(record)
