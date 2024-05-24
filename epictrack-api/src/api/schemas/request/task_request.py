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

from api.models.task_event import StatusEnum
from api.schemas.request.custom_fields import IntegerList

from .base import (
    RequestBodyParameterSchema,
    RequestPathParameterSchema,
    RequestQueryParameterSchema,
)


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


class TaskTemplateQueryParamSchema(RequestQueryParameterSchema):
    """Task template per phase, eaact and work type"""

    phase_id = fields.Int(
        metadata={"description": "Phase ID of the template"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    ea_act_id = fields.Int(
        metadata={"description": "EA Act ID of the template"},
        validate=validate.Range(min=1),
        allow_none=True,
    )

    work_type_id = fields.Int(
        metadata={"description": "Work Type ID of the template"},
        validate=validate.Range(min=1),
        allow_none=True,
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
        allow_none=True,
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

    work_phase_id = fields.Int(
        metadata={"description": "Work phase ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )


class TaskEventByStaffQueryParamSchema(RequestQueryParameterSchema):
    """Task events per work/phase query parameters"""

    is_active = fields.Bool(
        metadata={"description": "to filter for active or inactive tasks"},
        required=False,
    )


class TaskEventBodyParamSchema(RequestBodyParameterSchema):
    """Task events body parameter"""

    name = fields.Str(
        metadata={"description": "Name of the task"},
        required=True,
        validate=validate.Length(max=80)
    )

    work_phase_id = fields.Int(
        metadata={"description": "Work phase ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )

    responsibility_ids = fields.List(
        fields.Int(validate=validate.Range(min=1)),
        metadata={"description": "Ids of the responsible entities"},
        required=False,
        validate=validate.Length(min=0),
    )

    start_date = fields.DateTime(
        metadata={"description": "Start date for the work"}, required=True
    )

    number_of_days = fields.Int(metadata={"description": "Number of days of the task"})

    tips = fields.Str(
        metadata={"description": "Tips for the task"},
        allow_none=True,
    )

    notes = fields.Str(metadata={"description": "Notes for the task"}, allow_none=True)

    assignee_ids = fields.List(
        fields.Int(metadata={"description": "List of assignees of the task"})
    )

    status = fields.Str(
        metadata={"description": "Status of the task"},
        required=True,
        validate=validate.OneOf([v.value for v in StatusEnum]),
    )


class CopyTaskEventBodyParameterSchema(RequestBodyParameterSchema):
    """Copy Task event body parameter schema"""

    source_work_id = fields.Int(
        metadata={"description": "Source work id"}, required=True
    )

    target_work_id = fields.Int(
        metadata={"description": "Target work id to which the tasks event to be copied"}
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

    work_phase_id = fields.Int(
        metadata={"description": "Work phase ID of the event configuration"},
        validate=validate.Range(min=1),
        required=True,
    )


class TaskEventBulkUpdateBodyParamSchema(RequestBodyParameterSchema):
    """Task events body parameter"""

    task_ids = fields.List(
        fields.Int(validate=validate.Range(min=1)),
        metadata={"description": "Ids of tasks"},
        validate=validate.Length(min=1),
        required=True,
    )

    responsibility_ids = fields.List(
        fields.Int(validate=validate.Range(min=1)),
        metadata={"description": "Ids of the responsible entities"},
        required=False,
        validate=validate.Length(min=1),
    )

    assignee_ids = fields.List(
        fields.Int(
            metadata={"description": "List of assignees of the task"},
            validate=validate.Range(min=1),
        ),
        required=False,
        validate=validate.Length(min=1),
    )

    status = fields.Str(
        metadata={"description": "Status of the task"},
        allow_none=True,
        required=False,
        validate=validate.OneOf([v.value for v in StatusEnum]),
    )


class TasksBulkDeleteQueryParamSchema(RequestQueryParameterSchema):
    """Tasks bulk delete query parameter"""

    task_ids = IntegerList(metadata={"description": "comma separated task ids"})
    work_id = fields.Int(
        metadata={"description": "Work id of the task"},
        validate=validate.Range(min=1),
        required=True,
    )
