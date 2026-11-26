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
"""Tests for reading work template versions."""
import pytest

from api.exceptions import ResourceNotFoundError
from api.models import WorkTemplate
from api.services.work_template import WorkTemplateService
from api.workplan.legacy import build_version_from_legacy, load_legacy_sets
from api.workplan.rules import get_rule_set


def test_each_version_one_loads_back_as_its_legacy_rows_build_it(session):
    """Loading a saved version gives back exactly the version the migration built and saved."""
    sets = load_legacy_sets(session.connection())

    assert len(sets) == WorkTemplate.query.count()
    for legacy in sets:
        template = WorkTemplate.query.filter_by(work_type_id=legacy.work_type_id, ea_act_id=legacy.ea_act_id).one()
        built, _ = build_version_from_legacy(legacy, get_rule_set("EAO"))

        record, version = WorkTemplateService.find_version(template.id, 1)

        assert (record.version, record.based_on_version_id) == (1, None), legacy.name
        assert version == built, legacy.name


def test_a_version_the_template_lacks_is_not_found():
    """Asking for a version that doesn't exist raises, so the endpoint can return 404."""
    template = WorkTemplate.query.order_by(WorkTemplate.id).first()

    with pytest.raises(ResourceNotFoundError):
        WorkTemplateService.find_version(template.id, 99)
