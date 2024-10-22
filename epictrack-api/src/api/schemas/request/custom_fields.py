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

    def _deserialize(
        self,
        value: Any,
        attr: Union[str, None],
        data: Union[Mapping[str, Any], None],
        **kwargs,
    ):
        try:
            return [int(v.strip()) for v in value.split(",")]
        except ValueError as err:
            raise ValidationError(str(err)) from err


class CommaSeparatedEnumList(fields.Field):
    """Custom marshmallow field for comma separated enum list"""

    def __init__(self, enum, **kwargs):
        """Init"""
        self.enum = enum
        super().__init__(**kwargs)

    def _deserialize(self, value, attr, data, **kwargs):
        """Deserialize"""
        if not value:
            return []

        if not isinstance(value, str):
            raise ValidationError("Invalid input type.")

        values = value.split(",")
        enum_values = []

        for val in values:
            try:
                enum_value = val
                enum_values.append(enum_value)
            except ValueError as exc:
                raise ValidationError(
                    f"'{val}' is not a valid {self.enum.__name__} value."
                ) from exc

        return enum_values
