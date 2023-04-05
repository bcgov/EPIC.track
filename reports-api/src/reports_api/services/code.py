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
"""Service to manage Fee Calculation."""

from flask import current_app
from sqlalchemy import text

from reports_api.models import CodeTable
from reports_api.utils.helpers import find_model_from_table_name


class CodeService:
    """Service to manage Fee related operations."""

    @classmethod
    def find_code_values_by_type(
            cls,
            code_type: str,
            filters: dict = {}
    ):  # pylint: disable=dangerous-default-value
        """Find code values by code type."""
        current_app.logger.debug(f'<find_code_values_by_type : {code_type}')
        model: CodeTable = find_model_from_table_name(code_type)
        response = {'codes': []}
        filters = {k: v for k, v in filters.items() if hasattr(model, k)}
        order_by_fields = ["id"]
        if hasattr(model, 'is_active'):
            filters['is_active'] = True
        if hasattr(model, 'is_deleted'):
            filters['is_deleted'] = False
        if hasattr(model, 'sort_order'):
            order_by_fields.insert(0, "sort_order")
        for row in model.query.filter_by(**filters).order_by(text(*order_by_fields)):
            response['codes'].append(row.as_dict())

        current_app.logger.debug('>find_code_values_by_type')
        return response

    @classmethod
    def find_code_value_by_type_and_code(
            cls,
            code_type: str,
            code: str
    ):
        """Find code values by code type and code."""
        current_app.logger.debug(f'<find_code_value_by_type_and_code : {code_type} - {code}')
        model: CodeTable = find_model_from_table_name(code_type)
        current_app.logger.debug('>find_code_value_by_type_and_code')
        return model.find_by_id(code).as_dict()
