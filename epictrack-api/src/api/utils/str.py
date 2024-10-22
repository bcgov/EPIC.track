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
"""String helpers"""
import locale
from http import HTTPStatus
from typing import List, Text

from natsort import humansorted, ns

from api.exceptions import BusinessError


def escape_characters(source_string: Text, characters_to_escape: List[Text]) -> Text:
    """Returns character escaped string"""
    for character in characters_to_escape:
        source_string = source_string.replace(character, fr"\{character}")
    return source_string


def natural_sort(data: List, key: str = None) -> List[dict]:
    """Sort the data based on natural sort algorithms."""
    locale.setlocale(locale.LC_ALL, "")
    if isinstance(data[0], dict):
        if key:
            data = humansorted(data, key=lambda x: fr"{x[key]}", alg=ns.LOCALE)
        else:
            raise BusinessError("Key not provided to 'natural_sort'", HTTPStatus.FAILED_DEPENDENCY)
    else:
        data = humansorted(data)
    return data
