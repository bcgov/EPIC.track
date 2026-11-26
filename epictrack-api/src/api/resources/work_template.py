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
"""Resource for the read-only work template endpoints."""
from http import HTTPStatus

from flask_restx import Namespace, Resource, cors

from api.schemas.response.work_template_response import (
    WorkTemplateResponseSchema, WorkTemplateVersionSummarySchema, version_tree)
from api.services.work_template import WorkTemplateService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("work-templates", description="Work templates")


@cors_preflight("GET")
@API.route("", methods=["GET", "OPTIONS"])
class WorkTemplates(Resource):
    """Endpoint resource for work templates."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return every work template and its versions."""
        return WorkTemplateResponseSchema(many=True).dump(WorkTemplateService.find_all()), HTTPStatus.OK


@cors_preflight("GET")
@API.route("/<int:template_id>/versions/<int:version>", methods=["GET", "OPTIONS"])
@API.doc(params={"template_id": "The work template's id", "version": "The version number"})
class WorkTemplateVersion(Resource):
    """Endpoint resource for one version of a work template."""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get(template_id, version):
        """Return a version with its phases, milestones, outcomes and effects."""
        record, tree = WorkTemplateService.find_version(template_id, version)
        return {**WorkTemplateVersionSummarySchema().dump(record), **version_tree(tree)}, HTTPStatus.OK
