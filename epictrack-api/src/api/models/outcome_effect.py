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
"""What a work's outcome does, with targets in the same work."""
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from .base_model import BaseModelVersioned


class OutcomeEffect(BaseModelVersioned):  # pylint: disable=too-few-public-methods
    """One thing a work's outcome does, run in sort order. The kinds and params are the template effects'."""

    __tablename__ = "outcome_effects"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    outcome_configuration_id = sa.Column(sa.ForeignKey("outcome_configurations.id"), nullable=False, index=True)
    sort_order = sa.Column(sa.Integer, nullable=False)
    # Varchar, not a native enum, so a rule set can add its own kinds.
    kind = sa.Column(sa.String(50), nullable=False)
    target_work_phase_id = sa.Column(sa.ForeignKey("work_phases.id"), nullable=True)
    target_event_configuration_id = sa.Column(sa.ForeignKey("event_configurations.id"), nullable=True)
    # Version 1's rows, for a phase ADD_PHASES adds and for a target in one an earlier effect adds.
    target_template_phase_id = sa.Column(sa.ForeignKey("template_phases.id"), nullable=True)
    target_template_event_id = sa.Column(sa.ForeignKey("template_events.id"), nullable=True)
    params = sa.Column(JSONB, nullable=False, default=dict)
