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
"""Work resource's input validations"""
from marshmallow import fields, validate

from .base import (
    RequestBodyParameterSchema,
    RequestPathParameterSchema,
    RequestQueryParameterSchema,
)


class WorkBodyParameterSchema(RequestBodyParameterSchema):
    """Work request body schema"""

    title = fields.Str(
        metadata={"description": "Title of work"},
        validate=validate.Length(max=150),
        required=True,
    )

    short_description = fields.Str(
        metadata={"description": "Short description of work"},
        validate=validate.Length(max=500),
        required=True,
    )
    long_description = fields.Str(
        metadata={"description": "Long description of work"},
        validate=validate.Length(max=2000),
        allow_none=True,
        load_default=None,
    )
    start_date = fields.DateTime(
        metadata={"description": "Start date for the work"}, required=True
    )

    ea_act_id = fields.Int(
        metadata={"description": "EA Act id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )

    work_type_id = fields.Int(
        metadata={"description": "WorkType id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )

    project_id = fields.Int(
        metadata={"description": "Project id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )

    ministry_id = fields.Int(
        metadata={"description": "Ministry id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )
    federal_involvement_id = fields.Int(
        metadata={"description": "Federal involvement id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )

    substitution_act_id = fields.Int(
        metadata={"description": "Substitution act id of the work"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    eao_team_id = fields.Int(
        metadata={"description": "EAO Team id of the work"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    responsible_epd_id = fields.Int(
        metadata={"description": "Responsible EPD id of the work"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    work_lead_id = fields.Int(
        metadata={"description": "Work lead id of the work"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    decision_by_id = fields.Int(
        metadata={"description": "Decision maker id of the work"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    is_active = fields.Bool(metadata={"description": "Active state of the work"})
    is_watched = fields.Bool(
        metadata={"description": "Watched state of the work"}, default=False
    )
    is_cac_recommended = fields.Bool(
        metadata={"description": "Is CAC recommended for the work"}, default=False
    )
    is_pecp_required = fields.Bool(
        metadata={"description": "Is PCP recommended for the work"}, default=False
    )


class WorkExistenceQueryParamSchema(RequestQueryParameterSchema):
    """Work existence check query parameters"""

    title = fields.Str(
        metadata={"description": "Title of the work"},
        validate=validate.Length(max=150),
        required=True,
    )

    work_id = fields.Int(
        metadata={"description": "The id of the work"},
        validate=validate.Range(min=1),
        load_default=None,
    )


class WorkIdPathParameterSchema(RequestPathParameterSchema):
    """work id path parameter schema"""

    work_id = fields.Int(
        metadata={"description": "The id of the work"},
        validate=validate.Range(min=1),
        required=True,
    )


class WorkPlanDownloadQueryParamSchema(RequestQueryParameterSchema):
    """Workplan download query parameters"""

    work_phase_id = fields.Int(
        metadata={"description": "Id of work phase"},
        validate=validate.Range(min=1),
        required=True,
    )


class WorkIdPhaseIdPathParameterSchema(RequestPathParameterSchema):
    """Work id and phase id path parameter schema"""

    work_phase_id = fields.Int(
        metadata={"description": "Work phase ID"},
        validate=validate.Range(min=1),
        required=True,
    )


class WorkFirstNationNotesBodySchema(RequestBodyParameterSchema):
    """Work first nation notes body parameter schema"""

    notes = fields.Str(
        metadata={"description": "First nation notes"},
        validate=validate.Length(min=1),
        required=True,
    )
