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
"""The rule sets, by the name a work type gives in work_types.rule_set."""
from api.workplan.core.registry import RuleSet

from .eao import RULE_SET as EAO_RULE_SET

RULE_SETS = {EAO_RULE_SET.name: EAO_RULE_SET}


def get_rule_set(name: str) -> RuleSet:
    """Return the rule set with this name."""
    if name not in RULE_SETS:
        raise ValueError(f"There's no rule set called {name!r}")
    return RULE_SETS[name]
