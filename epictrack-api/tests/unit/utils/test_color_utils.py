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

"""Tests to assure the CORS utilities.

Test-Suite to ensure that the CORS decorator is working as expected.
"""
import pytest

from api.utils.color_utils import color_with_opacity


TEST_COLOR_CONVERT_DATA = [
    ["#54858d", "#aac2c6", "#d4e0e2"],
    ["#da6d65", "#ecb6b2", "#f6dad8"],
    ["#043673", "#829ab9", "#c0cddc"],
    ["#4d95d0", "#a6cae8", "#d2e4f3"],
    ["#e7a913", "#f3d489", "#f9eac4"],
    ["#6a54a3", "#b4aad1", "#dad4e8"],
    ["#6d7274", "#b6b8ba", "#dadcdc"],
    ["#a6bb2e", "#d2dd96", "#e9eecb"],
    ["#3eb1d7", "#9ed8eb", "#cfecf5"],
]


@pytest.mark.parametrize("orig_color,fifty_perc,twenty_five_perc", TEST_COLOR_CONVERT_DATA)
def test_cors_preflight_post(orig_color, fifty_perc, twenty_five_perc):
    """Assert that the function output match 50% and 25% values."""
    assert color_with_opacity(orig_color, 50) == fifty_perc
    assert color_with_opacity(orig_color, 25) == twenty_five_perc
