# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Insight resource's input validations"""
from marshmallow import fields

from .base import RequestQueryParameterSchema
from datetime import datetime


class WorkInsightRequestQueryParameterSchema(RequestQueryParameterSchema):
    """Work insight query parameter schema"""

    group_by = fields.Str(
        metadata={"description": "Group by field name"},
        required=True,
    )

    filters = fields.Field(
        metadata={"description": "Additional filters to apply"},
        required=False,
        missing=None
    )


class ProjectInsightRequestQueryParameterSchema(RequestQueryParameterSchema):
    """Project insight query parameter schema"""

    group_by = fields.Str(
        metadata={"description": "Group by field name"},
        required=True,
    )

    type_id = fields.Int(
        metadata={"description": "Type id to filter by (optional)"},
        required=False,
        missing=None
    )

    filters = fields.Field(
        metadata={"description": "Additional filters to apply"},
        required=False,
        missing=None
    )


class PhaseInsightRequestQueryParameterSchema(RequestQueryParameterSchema):
    """Work insight query parameter schema"""

    group_by = fields.Str(
        metadata={"description": "Group by field name"},
        required=True,
    )

    filters = fields.Field(
        metadata={"description": "Additional filters to apply"},
        required=False,
        missing=None
    )

    selected_work_type_id = fields.Str(
        metadata={"description": "Selected work type to filter by (optional)"},
        required=False,
        default="all",
    )

    selected_phase_id = fields.Str(
        metadata={"description": "Selected phase to filter by (optional)"},
        required=False,
        missing="all"
    )

    selected_year = fields.Int(
        metadata={"description": "Selected year to filter by (optional)"},
        required=False,
        default=datetime.now().year,
        missing=datetime.now().year
    )
