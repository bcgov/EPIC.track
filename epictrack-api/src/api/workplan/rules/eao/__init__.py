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
"""EAO's rule set: what's specific to environmental assessment work."""
from api.workplan.core import template as tpl
from api.workplan.core.registry import EffectKind, make_rule_set


def default_day_basis(phase, previous):
    """Day Zero for a legislated phase after a non-legislated one (the EA Act), otherwise Day One."""
    if phase.time_limit_kind == tpl.LEGISLATED and previous is not None and previous.time_limit_kind != tpl.LEGISLATED:
        return tpl.DAY_ZERO
    return tpl.DAY_ONE


RULE_SET = make_rule_set(
    "EAO",
    default_day_basis=default_day_basis,
    effect_kinds=(
        EffectKind("SET_FEDERAL_INVOLVEMENT", params={"federal_involvement_id": (int, type(None))}),
        EffectKind("SET_PROJECT_STATUS", params={"is_active": (bool,)}),
        EffectKind("SET_PROJECT_STATE", params={"project_state_id": (int,)}),
    ),
)
