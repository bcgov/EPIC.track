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
"""Service to manage ActSection."""
from datetime import datetime


def find_event_date(event) -> datetime:
    """Returns the event actual or anticipated date"""
    return event.actual_date if event.actual_date else event.anticipated_date


def event_compare_func(event_x, event_y):
    """Compare function for event sort"""
    # if (
    #     event_x.event_position == EventPositionEnum.START.value
    #     or event_y.event_position == EventPositionEnum.END.value
    # ):
    #     return -1
    # if (
    #     event_y.event_position == EventPositionEnum.START.value
    #     or event_x.event_position == EventPositionEnum.END.value
    # ):
    #     return 1
    if (find_event_date(event_x).date() - find_event_date(event_y).date()).days == 0:
        return -1 if event_x.id < event_y.id else 1
    if (find_event_date(event_x).date() - find_event_date(event_y).date()).days < 0:
        return -1
    if (find_event_date(event_x).date() - find_event_date(event_y).date()).days > 0:
        return 1
    return 0
