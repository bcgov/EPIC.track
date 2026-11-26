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
"""Work template response schemas."""
import uuid
from dataclasses import asdict

from marshmallow import Schema, fields

from api.workplan.core import template as tpl


class WorkTemplateVersionSummarySchema(Schema):
    """A template version without its phases."""

    id = fields.Int()
    work_template_id = fields.Int()
    version = fields.Int()
    status = fields.Method("get_status")
    change_note = fields.Str()
    based_on_version_id = fields.Int(allow_none=True)
    published_at = fields.DateTime()
    published_by = fields.Str()

    def get_status(self, obj):
        """Return the status's name."""
        return obj.status.value


class WorkTemplateResponseSchema(Schema):
    """A work template and its versions."""

    id = fields.Int()
    work_type_id = fields.Int()
    ea_act_id = fields.Int()
    name = fields.Str()
    versions = fields.Nested(WorkTemplateVersionSummarySchema, many=True)


def version_tree(version: tpl.Version) -> dict:
    """Return a version's phases, milestones, outcomes and effects, keyed as the core keys them."""
    return _jsonable(asdict(version))


def _jsonable(value):
    if isinstance(value, dict):
        return {key: _jsonable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_jsonable(item) for item in value]
    if isinstance(value, uuid.UUID):
        return str(value)
    return value
