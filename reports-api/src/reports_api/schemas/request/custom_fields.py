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
"""Custom marshmallow fields"""
from typing import Any, Mapping, Union

from marshmallow import ValidationError, fields


class IntegerList(fields.Field):
    """List of comma separated values"""

    def _deserialize(self, value: Any, attr: Union[str, None], data: Union[Mapping[str, Any], None], **kwargs):
        try:
            return [int(v.strip()) for v in value.split(",")]
        except ValueError as err:
            raise ValidationError(str(err)) from err
