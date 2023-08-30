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
"""Exposes all of the resource endpoints mounted in Flask-Blueprint style.

Uses restplus namespaces to mount individual api endpoints into the service.

All services have 2 defaults sets of endpoints:
 - ops
 - meta
That are used to expose operational health information about the service, and meta information.
"""
from importlib.resources import path

from flask import Blueprint

from .apihelper import Api
from .code import API as CODES_API
from .event import API as EVENT_API
from .event_template import API as EVENT_TEMPLATE_API
from .indigenous_nation import API as INDIGENOUS_NATION_API
from .inspection import API as INSPECTION_API
from .lookup_data_generator import API as LOOKUP_API
from .meta import API as META_API
from .ops import API as OPS_API
from .outcome import API as OUTCOME_API
from .phase import API as PHASE_API
from .project import API as PROJECTS_API
from .proponent import API as PROPONENT_API
from .reminder_configuration import API as REMINDER_CONFIGURATION_API
from .reports import API as REPORTS_API
from .staff import API as STAFF_API
from .sub_types import API as SUB_TYPES_API
from .sync_form_data import API as SYNC_FORM_DATA_API
from .task import API as TASK_API
from .task_template import API as TASK_TEMPLATE_API
from .user import API as USER_API
from .work import API as WORK_API
from .event_configuration import API as EVENT_CONFIGURATION_API


__all__ = ("API_BLUEPRINT", "OPS_BLUEPRINT")

# This will add the Authorize button to the swagger docs
AUTHORIZATIONS = {"apikey": {"type": "apiKey", "in": "header", "name": "Authorization"}}

OPS_BLUEPRINT = Blueprint("API_OPS", __name__, url_prefix="/ops")

API_OPS = Api(
    OPS_BLUEPRINT,
    title="Service OPS API",
    version="1.0",
    description="The Core API for the Reports System",
    security=["apikey"],
    authorizations=AUTHORIZATIONS,
)

API_OPS.add_namespace(OPS_API, path="/")

API_BLUEPRINT = Blueprint("API", __name__, url_prefix="/api/v1")

API = Api(
    API_BLUEPRINT,
    title="EAO Reports API",
    version="1.0",
    description="The Core API for the Reports System",
    security=["apikey"],
    authorizations=AUTHORIZATIONS,
)

API.add_namespace(META_API, path="/meta")
API.add_namespace(CODES_API, path="/codes")
API.add_namespace(PROJECTS_API, path="/projects")
API.add_namespace(SYNC_FORM_DATA_API, path="/sync-form-data")
API.add_namespace(PHASE_API, path="/phases")
API.add_namespace(STAFF_API, path="/staffs")
API.add_namespace(OUTCOME_API, path="/outcomes")
API.add_namespace(SUB_TYPES_API, path="/sub-types")
API.add_namespace(INSPECTION_API, path="/inspections")
API.add_namespace(WORK_API, path="/works")
API.add_namespace(LOOKUP_API, path="/lookups")
API.add_namespace(REPORTS_API, path="/reports")
API.add_namespace(INDIGENOUS_NATION_API, path="/indigenous-nations")
API.add_namespace(PROPONENT_API, path="/proponents")
API.add_namespace(REMINDER_CONFIGURATION_API, path="/reminder-configurations")
API.add_namespace(USER_API, path='/users')
API.add_namespace(TASK_TEMPLATE_API, path="/task-templates")
API.add_namespace(EVENT_TEMPLATE_API, path="/event-templates")
API.add_namespace(TASK_API, path="/tasks")
API.add_namespace(EVENT_API, path="/events")
API.add_namespace(EVENT_CONFIGURATION_API, path="/event-configurations")
