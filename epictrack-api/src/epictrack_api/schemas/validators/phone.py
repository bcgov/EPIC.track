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
"""Phone validator"""
import re
from typing import Union
from marshmallow import ValidationError, validate


class Phone(validate.Validator):  # pylint: disable=too-few-public-methods
    """Phone number validation"""

    PHONE_REGEX = re.compile(
        r"^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$"
    )
    default_message = 'Invalid phone number'

    def __init__(self, *, error: Union[str, None] = None):
        """Init"""
        self.error = error or self.default_message

    def _format_error(self, value: str) -> str:
        """Format the error message with the given value"""
        return self.error.format(input=value)

    def __call__(self, value: str) -> str:
        """Execute the validation"""
        message = self._format_error(value)
        if not self.PHONE_REGEX.match(value):
            raise ValidationError(message)
