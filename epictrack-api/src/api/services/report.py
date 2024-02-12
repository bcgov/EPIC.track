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
"""Service to manage Reports."""

from api.reports import get_report_generator


class ReportService:  # pylint: disable=too-few-public-methods, too-many-arguments
    """Service to manage report related operations."""

    @classmethod
    def generate_report(cls, report_type, report_date, return_type='json', filters=None, color_intensity=None):
        """Generate a report"""
        report_generator = get_report_generator(report_type, filters, color_intensity)
        report, file_name = report_generator.generate_report(report_date, return_type)
        if return_type == 'json':
            return report
        return report, file_name
