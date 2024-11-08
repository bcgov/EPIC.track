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

"""CORS pre-flight decorator.

A simple decorator to add the options method to a Request Class.
"""


def cors_preflight(methods: str = "GET"):
    """Render an option method on the class."""

    def wrapper(f):
        def options(self, *args, **kwargs):  # pylint: disable=unused-argument
            return (
                {"Allow": methods},
                200,
                {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": methods,
                    "Access-Control-Allow-Headers": "Authorization, Content-Type, registries-trace-id, Account-Id",
                },
            )

        setattr(f, "options", options)
        return f

    return wrapper


def find_index_in_array(json_array, target_object):
    """Find the index of object in an array"""
    for index, json_obj in enumerate(json_array):
        if json_obj == target_object:
            return index
    return -1  # Return -1 if not found


def generate_title(project_name, work_type_name, simple_title=''):
    """Generate the title string for a work."""
    parts = [project_name, work_type_name]
    if simple_title:
        parts.append(simple_title)
    return ' - '.join(parts)


def process_data(data, return_type):
    """Process data based on the return type."""
    if return_type == "json" and data:
        return {"data": data}, None
    if not data:
        return {}, None
