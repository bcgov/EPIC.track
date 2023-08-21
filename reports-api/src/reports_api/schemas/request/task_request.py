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
"""Task resource's input validations"""
from marshmallow import fields, validate

from reports_api.models.task_event import StatusEnum
from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class TaskTemplateBodyParameterSchema(RequestBodyParameterSchema):
    """TaskTemplate request body schema"""

    name = fields.Str(
        metadata={"description": "Name of task template"},
        validate=validate.Length(max=150),
        required=True,
    )

    ea_act_id = fields.Int(
        metadata={"description": "EAAct id of the task template"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Phase id of the task template"},
        validate=validate.Range(min=1),
        required=True,
    )

    work_type_id = fields.Int(
        metadata={"description": "WorkType id of the task template"},
        validate=validate.Range(min=1),
        required=True,
    )

    is_active = fields.Bool(
        metadata={"description": "Active state of the task"},
        default=False,
        missing=False,
    )


class TaskBodyParameterSchema(RequestBodyParameterSchema):
    """TaskTemplate request body schema"""

    name = fields.Str(
        metadata={"description": "Name of task"},
        validate=validate.Length(max=150),
        required=True,
    )

    tips = fields.Str(
        metadata={"description": "Practical info on why/how to do the task"},
        # validate=validate.Length(max=150),
        required=True,
    )

    number_of_days = fields.Int(
        metadata={"description": "Number of days for the task to complete"},
        validate=validate.Range(min=0),
        required=True,
    )

    start_at = fields.Int(
        metadata={"description": "Number of days from start of phase when task starts"},
        validate=validate.Range(min=0),
        required=True,
    )

    template_id = fields.Int(
        metadata={"description": "TaskTemplate id of the task"},
        validate=validate.Range(min=1),
        required=True,
    )

    responsibility_id = fields.Int(
        metadata={"description": "Responsibility id of the task"},
        validate=validate.Range(min=1),
        required=True,
    )

    is_active = fields.Bool(
        metadata={"description": "Active state of the task"},
    )


class TaskTemplateIdPathParameterSchema(RequestPathParameterSchema):
    """Staff id path parameter schema"""

    template_id = fields.Int(
        metadata={"description": "The id of the template"},
        validate=validate.Range(min=1),
        required=True,
    )


class TaskEventQueryParamSchema(RequestQueryParameterSchema):
    """Task events per work/phase query parameters"""

    work_id = fields.Int(
        metadata={"description": "Work ID for the events"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Phase ID for the events"},
        validate=validate.Range(min=1),
        required=True,
    )


class TaskEventBodyParamSchema(RequestBodyParameterSchema):
    """Task events body parameter"""

    name = fields.Str(
        metadata={"description": "Name of the task"},
        required=True,
    )

    work_id = fields.Int(
        metadata={"description": "Id of work"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Id of the phase"},
        validate=validate.Range(min=1),
        required=True,
    )

    responsibility_id = fields.Int(
        metadata={"description": "Id of the responsible entity"},
        allow_none=True,
        validate=validate.Range(min=1)
    )

    start_date = fields.DateTime(
        metadata={"description": "Start date for the work"},
        required=True
    )

    number_of_days = fields.Int(
        metadata={"description": "Number of days of the task"}
    )

    tips = fields.Str(
        metadata={"description": "Tips for the task"},
        allow_none=True,
    )

    notes = fields.Str(
        metadata={"description": "Notes for the task"}
    )

    assignee_ids = fields.List(fields.Int(
        metadata={"description": "List of assignees of the task"}
    ))

    status = fields.Str(
        metadata={"description": "Status of the task"},
        required=True,
        validate=validate.OneOf([v.value for v in StatusEnum])
    )


class TaskEventIdPathParameterSchema(RequestPathParameterSchema):
    """Staff id path parameter schema"""

    event_id = fields.Int(
        metadata={"description": "The id of the task event"},
        validate=validate.Range(min=1),
        required=True,
    )


class TaskTemplateImportEventsBodyParamSchema(RequestBodyParameterSchema):
    """Task template import events schema"""

    work_id = fields.Int(
        metadata={"description": "Id of work"},
        validate=validate.Range(min=1),
        required=True,
    )

    phase_id = fields.Int(
        metadata={"description": "Id of the phase"},
        validate=validate.Range(min=1),
        required=True,
    )
