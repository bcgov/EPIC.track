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
"""Helper Utils Color operations."""
import numpy as np
from matplotlib.colors import hex2color, to_hex


def color_with_opacity(color_code: str, opacity: int) -> str:
    """Function to add opacity to color code (HEX).

    Arguments:
        color_code {str} -- RGB color code in hexadecimal format
        opacity {int} -- % of opacity. Lower value means more transparent

    Returns:
        str -- Returns the hexadecimal color code after adding opacity
    """
    alpha = int(opacity) / 100
    # Assuming background to be white
    bg_color = hex2color("#FFFFFF")
    # Convert to numpy array so that multiplication will work
    bg_color = np.array(bg_color)
    color = hex2color(color_code)
    color = np.array(color)
    result = bg_color * (1 - alpha) + color * alpha
    return to_hex(result)
