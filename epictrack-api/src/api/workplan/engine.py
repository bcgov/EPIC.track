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
"""Which date engine an environment runs, set by PHASE_ENGINE.

v1 is the current engine. v2 works from the template versions, and replaces v1 a piece at a time behind this
setting, so each environment switches when it's ready and can switch back.
"""
from flask import current_app

from api.workplan.core import template as tpl

V1 = "v1"
V2 = "v2"

# Running works' ENDs were planned the Day Zero way, so they're counted that way until the cut-over re-plans them.
V1_DAY_BASIS = tpl.DAY_ZERO


def runs_v2() -> bool:
    """Whether this environment runs the template versions' engine."""
    return current_app.config.get("PHASE_ENGINE", V1) == V2
