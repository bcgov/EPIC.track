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
"""Tests for the work type behaviour stored as data."""
from api.models.work_phase import WorkPhase
from api.models.work_type import WorkType, WorkTypeEnum
from api.schemas.response.work_response import WorkPhaseResponseSchema


AMENDMENT_TYPES = {WorkTypeEnum.AMENDMENT.value, WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value}


def test_phase_response_includes_requires_overage_responsibility():
    """The work phase response carries the flag the web reads."""
    dumped = WorkPhaseResponseSchema(only=("requires_overage_responsibility",)).dump(
        WorkPhase(requires_overage_responsibility=True))
    assert dumped == {"requires_overage_responsibility": True}


def test_amendment_types_require_overage_responsibility_in_every_phase(db):  # pylint: disable=unused-argument
    """Only Amendment and Joint Complex Amendment require one in every phase."""
    for work_type in WorkType.query.all():
        assert work_type.all_phases_require_overage_responsibility is (work_type.id in AMENDMENT_TYPES), work_type.name


def test_work_types_keep_their_default_report_descriptions(db):  # pylint: disable=unused-argument
    """The work types that had a default report description keep it."""
    with_description = {
        work_type.id for work_type in WorkType.query.all() if work_type.default_report_description
    }
    assert with_description == {1, 2, 3, 5, 6, 7, 9, 10, 11, 15, 16}
