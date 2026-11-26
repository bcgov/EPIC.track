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
"""Tests for the read-only work template endpoints."""
import os
from http import HTTPStatus

from api.models import WorkTemplate

API_BASE_URL = "/api/v1/work-templates"
TEMPLATES = os.path.join(os.path.dirname(__file__), "../../../src/api/templates/event_templates")


def test_every_template_is_listed_with_its_versions(client, auth_header):
    """Each uploaded template is listed, with the version 1 the migration built from it."""
    response = client.get(API_BASE_URL, headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    assert len(response.json) == len(os.listdir(TEMPLATES))
    assert {(t["versions"][0]["version"], t["versions"][0]["status"]) for t in response.json} == {(1, "PUBLISHED")}


def test_a_version_comes_with_its_phases_milestones_and_effects(client, auth_header):
    """Anchors and effect targets refer to milestones by key, and phases by phase code, as the core does."""
    template = WorkTemplate.query.order_by(WorkTemplate.id).first()

    response = client.get(f"{API_BASE_URL}/{template.id}/versions/1", headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    body = response.json
    assert (body["work_type_id"], body["version"], body["status"], body["rule_set"]) == (
        template.work_type_id, 1, "PUBLISHED", "EAO")
    phase_codes = {phase["phase_code_id"] for phase in body["phases"]}
    events = [event for phase in body["phases"] for event in phase["events"]]
    keys = {event["key"] for event in events}
    effects = [effect for event in events for outcome in event["outcomes"] for effect in outcome["effects"]]
    assert {event["anchor_key"] for event in events} - {None} <= keys
    assert effects
    assert {effect["target_event_key"] for effect in effects} - {None} <= keys
    assert {effect["target_phase_code_id"] for effect in effects} - {None} <= phase_codes


def test_a_missing_version_is_not_found(client, auth_header):
    """A version the template doesn't have is a 404."""
    template = WorkTemplate.query.order_by(WorkTemplate.id).first()

    response = client.get(f"{API_BASE_URL}/{template.id}/versions/99", headers=auth_header)

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_the_templates_need_a_token(client):
    """Reading templates needs a signed-in user."""
    assert client.get(API_BASE_URL).status_code == HTTPStatus.UNAUTHORIZED
