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
"""Test Utils.

Test Utility for creating model factory.
"""
from faker import Faker
from flask import current_app, g
from tests.utilities.factory_scenarios import (
    TestProjectInfo)
from api.models.project import Project as ProjectModel


def factory_project_model(project_data: dict = TestProjectInfo.project1.value):
    """Produce a participant model."""
    project = ProjectModel(
        name=project_data["name"],
        description=project_data["description"],
        address=project_data["address"],
        type_id=project_data["type_id"],
        sub_type_id=project_data["sub_type_id"],
        proponent_id=project_data["proponent_id"],
        region_id_env=project_data["region_id_env"],
        region_id_flnro=project_data["region_id_flnro"],
        latitude=project_data["latitude"],
        longitude=project_data["longitude"],
        abbreviation=project_data["abbreviation"],
    )
    project.save()
    return project
