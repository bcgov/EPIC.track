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
"""Service to manage Lookups."""
from io import BytesIO
from xlsxwriter.workbook import Workbook


class LookupService():
    """Service to manage lookup related operations"""

    @classmethod
    def get_data_item(cls, data, key, value):
        """Returns the item in list that matches the given key and value"""
        return next((x for x in data if x[key] == value), None)

    @classmethod
    def generate_excel(cls, data):  # pylint: disable=too-many-locals
        """Generates an excel file containing the lookup data"""
        output = BytesIO()
        work_book = Workbook(output)
        header_format = work_book.add_format()
        cell_format = work_book.add_format()
        header_format.set_bold()
        header_format.set_align('center')
        cell_format.set_text_wrap()

        for key, value in data.items():

            sheet_name = " ".join(key.split('_')).title()
            work_sheet = work_book.add_worksheet(sheet_name)
            if not value:
                continue
            row = 0
            column = 0
            headers = list(map(lambda x: " ".join(x.split('_')).title(), value[0].keys()))
            work_sheet.write_row(row, column, headers, header_format)
            for row_data in value:
                row += 1
                work_sheet.write_row(row, column, row_data.values(), cell_format)
            work_sheet.autofit()
            work_sheet.set_column(0, 0, 5)
            if key == 'projects':
                columns = list(value[0].keys())
                description = columns.index('description')
                work_sheet.set_column(description, description, 100)
        work_book.read_only_recommended()
        work_book.close()
        output.seek(0)
        return output
