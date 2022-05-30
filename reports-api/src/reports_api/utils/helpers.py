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
"""Helper Util."""

from reports_api.models import db


def find_model_from_table_name(table_name: str):
    """Util to find model class from table name."""
    for model_class in db.Model._decl_class_registry.values():  # pylint:disable=protected-access
        if getattr(model_class, '__tablename__', None) == table_name:
            return model_class
    return None
