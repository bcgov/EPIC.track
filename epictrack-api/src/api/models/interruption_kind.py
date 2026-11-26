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
"""Who caused an extension or a suspension, as a rule set names it."""
import sqlalchemy as sa

from .base_model import BaseModel


class InterruptionKind(BaseModel):
    """A kind of time limit extension or suspension, such as a proponent suspension."""

    __tablename__ = "interruption_kinds"
    __table_args__ = (sa.UniqueConstraint("rule_set", "code", name="uq_interruption_kinds_rule_set_code"),)

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    rule_set = sa.Column(sa.String(50), nullable=False)
    code = sa.Column(sa.String(50), nullable=False)
    name = sa.Column(sa.String(100), nullable=False)
    # The event role this kind applies to: TIME_LIMIT_EXTENSION or TIME_LIMIT_SUSPENSION.
    role = sa.Column(sa.String(50), nullable=False)
    sort_order = sa.Column(sa.Integer, nullable=False)
