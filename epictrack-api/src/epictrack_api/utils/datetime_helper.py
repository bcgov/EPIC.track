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
"""Helper for datetime."""
from datetime import datetime
import pytz


def get_start_of_day(date: datetime):
    """Returns the date object with hours, minutes, seconds set as zero"""
    if date:
        date = date.replace(hour=2, minute=0, second=0, microsecond=0)
        date = date.astimezone(pytz.utc)
    return date
