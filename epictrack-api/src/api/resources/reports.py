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
"""Resource for Reports endpoints."""
from datetime import datetime
from http import HTTPStatus
from io import BytesIO

from flask import jsonify, send_file, current_app
from flask_restx import Namespace, Resource, cors

from api.schemas.event_calendar import EventCalendarSchema
from api.services import ReportService
from api.services.event import EventService
from api.utils import auth, profiletime
from api.utils.util import cors_preflight


API = Namespace("reports", description="Reports")


@cors_preflight("GET")
@API.route("/event-calendar", methods=["GET", "OPTIONS"])
class EventCalendarReport(Resource):
    """Endpoint resource to return calendar events for event calendar"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def get():
        """Return all calendar events."""
        calendar_events = EventService.find_events_by_date(datetime.now())
        return (
            jsonify(EventCalendarSchema(many=True).dump(calendar_events)),
            HTTPStatus.OK,
        )


@cors_preflight("GET")
@API.route("/<string:report_type>", methods=["POST", "OPTIONS"])
class Report(Resource):
    """Endpoint resource to generate reports"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(report_type):
        """Generate report from given date."""
        current_app.logger.debug(f"Generating report of type: {report_type}")
        current_app.logger.debug(f"Endpoint called: /reports/{report_type}")
        current_app.logger.debug(f"Request payload: {API.payload}")
        report_date = datetime.strptime(API.payload["report_date"], "%Y-%m-%d")
        color_intensity = API.payload.get("color_intensity", None)
        filters = API.payload.get("filters", None)
        report = ReportService.generate_report(
            report_type,
            report_date,
            "json",
            filters=filters,
            color_intensity=color_intensity,
        )
        if report:
            return jsonify(report), HTTPStatus.OK
        return report, HTTPStatus.NO_CONTENT


@cors_preflight("GET")
@API.route("/file/<string:report_type>", methods=["POST", "OPTIONS"])
class FileReport(Resource):
    """Endpoint resource to generate reports"""

    @staticmethod
    @cors.crossdomain(origin="*")
    @auth.require
    @profiletime
    def post(report_type):
        """Generate report from given date."""
        report_date = datetime.strptime(API.payload["report_date"], "%Y-%m-%d")
        color_intensity = API.payload.get("color_intensity", None)
        filters = API.payload.get("filters", None)
        report, file_name = ReportService.generate_report(
            report_type,
            report_date,
            "file",
            filters=filters,
            color_intensity=color_intensity,
        )
        if report:
            return send_file(
                BytesIO(report), as_attachment=True, download_name=file_name
            )
        return report, HTTPStatus.NO_CONTENT
