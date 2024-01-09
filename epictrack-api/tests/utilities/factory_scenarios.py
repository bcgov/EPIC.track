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

Test Utility for creating test scenarios.
"""
from enum import Enum
from faker import Faker

fake = Faker()


class TestProjectInfo(Enum):
    """Test scenarios of Project Creation."""

    project1 = {
        "name": fake.word(),
        "description": fake.sentence(),
        "address": fake.address(),
        "type_id": fake.random_int(min=1, max=10),
        "sub_type_id": fake.random_int(min=1, max=10),
        "proponent_id": fake.random_int(min=1, max=10),
        "region_id_env": fake.random_int(min=1, max=10),
        "region_id_flnro": fake.random_int(min=1, max=10),
        "latitude": fake.latitude(),
        "longitude": fake.longitude(),
        "abbreviation": fake.word().upper()[:10]

    }
