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

"""Test suite for SpecialFields."""
from datetime import datetime
from copy import copy
from http import HTTPStatus
from urllib.parse import urljoin

from psycopg2.extras import DateTimeTZRange

from api.models.special_field import EntityEnum, SpecialField
from api.utils.constants import CANADA_TIMEZONE
from tests.utilities.factory_scenarios import TestSpecialField
from tests.utilities.factory_utils import (
    factory_proponent_model,
    factory_special_field_model,
    factory_staff_model, factory_work_model,
)


API_BASE_URL = "/api/v1/"


def test_get_special_fields(client, auth_header):
    """Test get special fields."""
    url = urljoin(API_BASE_URL, "special-fields")
    entity_obj = factory_proponent_model()
    payload = {
        "entity": EntityEnum.PROPONENT.value,
        "entity_id": entity_obj.id,
        "field_name": "name",
    }
    result = client.get(url, query_string=payload, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_special_field(client, auth_header):
    """Test create new special field."""
    url = urljoin(API_BASE_URL, "special-fields")
    payload = copy(TestSpecialField.proponent_entity.value)
    entity_obj = factory_proponent_model()
    payload["entity_id"] = entity_obj.id

    # Scenario 1: Valid payload
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response_json
    assert payload["entity_id"] == response_json["entity_id"]
    assert payload["entity"] == response_json["entity"]
    assert payload["field_name"] == response_json["field_name"]
    assert payload["field_value"] == response_json["field_value"]
    # The entry starts at Pacific midnight of the day sent, whatever time of day came with it
    active_from = datetime.fromisoformat(response_json["active_from"]).astimezone(CANADA_TIMEZONE)
    assert active_from.date() == datetime.fromisoformat(payload["active_from"]).date()
    assert (active_from.hour, active_from.minute, active_from.second, active_from.microsecond) == (0, 0, 0, 0)

    # Scenario 2: Missing required fields
    del payload["entity_id"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["entity"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["field_name"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["field_value"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_get_special_field_details(client, auth_header):
    """Test get special field"""
    special_field = factory_special_field_model()
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json

    assert special_field.entity_id == response_json["entity_id"]
    assert special_field.entity.value == response_json["entity"]
    assert special_field.field_name == response_json["field_name"]
    assert special_field.field_value == response_json["field_value"]
    assert special_field.time_range.lower.isoformat() == response_json["active_from"]


def test_update_special_field(client, auth_header):
    """Test update special field"""
    special_field = factory_special_field_model()

    updated_data = copy(TestSpecialField.proponent_entity.value)
    updated_data["field_value"] = "Updated special value"
    updated_data["entity_id"] = special_field.entity_id
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json
    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == special_field.id
    assert response_json["field_value"] == updated_data["field_value"]


def test_add_special_field_with_upper_limit(client, auth_header):
    """Test update special field"""
    work = factory_work_model()
    staff1 = factory_staff_model()
    staff2 = factory_staff_model()
    first_special_field = TestSpecialField.work_entity.value
    first_special_field["entity_id"] = work.id
    first_special_field["field_value"] = str(staff1.id)
    first_special_field["active_from"] = datetime.fromisoformat(
        "2024-01-05T00:00:00-08:00"
    ).strftime("%Y-%m-%dT%H:%M:%S%z")
    special_field = factory_special_field_model(first_special_field)

    second_special_field = copy(TestSpecialField.work_entity.value)
    second_special_field["entity_id"] = work.id
    second_special_field["field_value"] = str(staff2.id)
    second_special_field["active_from"] = datetime.fromisoformat(
        "2024-02-05T00:00:00-08:00"
    ).strftime("%Y-%m-%dT%H:%M:%S%z")
    url = urljoin(API_BASE_URL, "special-fields")
    response = client.post(url, headers=auth_header, json=second_special_field)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json
    assert (
        datetime.strptime(response_json["active_from"], "%Y-%m-%dT%H:%M:%S%z").date()
        - datetime.strptime(
            first_special_field["active_from"], "%Y-%m-%dT%H:%M:%S%z"
        ).date()
    ).days == 0
    assert (
        datetime.strptime(
            second_special_field["active_from"], "%Y-%m-%dT%H:%M:%S%z"
        ).date()
        - datetime.strptime(response_json["active_to"], "%Y-%m-%dT%H:%M:%S%z").date()
    ).days == 1


def _proponent_name_entry(entity_id, value, active_from):
    """Build a request body for a proponent name history entry."""
    return {
        "entity": EntityEnum.PROPONENT.value, "entity_id": entity_id, "field_name": "name",
        "field_value": value, "field_type": "STRING", "active_from": active_from,
    }


def _assert_history_loads(client, auth_header, entity_id, expected_count):
    """The history list must load and every entry must have a start before its end."""
    url = urljoin(API_BASE_URL, f"special-fields?entity=PROPONENT&entity_id={entity_id}&field_name=name")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert len(response.json) == expected_count
    for entry in response.json:
        assert entry["active_from"] is not None
        if entry["active_to"] is not None:
            assert datetime.fromisoformat(entry["active_from"]) < datetime.fromisoformat(entry["active_to"])
    return response.json


def test_add_special_field_one_day_before_existing_entry(client, auth_header):
    """An entry added the day before an existing one is stored as a one-day entry, not an empty range.

    The empty range made every later read of that history fail with a 500.
    """
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    for value, active_from in [
        ("first", "2024-01-05T00:00:00-08:00"),
        ("third", "2024-02-05T00:00:00-08:00"),
        ("second", "2024-02-04T00:00:00-08:00"),
    ]:
        response = client.post(
            url, headers=auth_header, json=_proponent_name_entry(proponent.id, value, active_from)
        )
        assert response.status_code == HTTPStatus.CREATED

    assert response.json["active_from"] is not None
    assert datetime.fromisoformat(response.json["active_to"]) == datetime.fromisoformat("2024-02-05T00:00:00-08:00")
    _assert_history_loads(client, auth_header, proponent.id, 3)


def test_add_special_field_less_than_a_day_before_existing_entry(client, auth_header):
    """An entry added hours before an existing one ends where that one starts.

    Entries written inside the API carry a time of day, so a new entry on the same day
    starts less than a day before them and "a day before the next start" is in its past.
    """
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    later = factory_special_field_model(
        _proponent_name_entry(proponent.id, "later", datetime.fromisoformat("2024-02-05T10:00:00-08:00"))
    )

    response = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "earlier", "2024-02-05")
    )

    assert response.status_code == HTTPStatus.CREATED
    assert datetime.fromisoformat(response.json["active_from"]) == datetime.fromisoformat("2024-02-05T00:00:00-08:00")
    assert datetime.fromisoformat(response.json["active_to"]) == later.time_range.lower
    _assert_history_loads(client, auth_header, proponent.id, 2)


def test_update_special_field_beside_an_empty_entry(client, auth_header):
    """An entry stored with an empty range before this fix does not stop its neighbours being updated."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    created = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "first", "2024-01-05")
    )
    client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "second", "2024-03-05"))
    SpecialField(
        entity=EntityEnum.PROPONENT, entity_id=proponent.id, field_name="name", field_value="broken",
        time_range=DateTimeTZRange(empty=True),
    ).save()

    response = client.put(
        urljoin(API_BASE_URL, f"special-fields/{created.json['id']}"), headers=auth_header,
        json=_proponent_name_entry(proponent.id, "first renamed", "2024-01-05"),
    )

    assert response.status_code == HTTPStatus.OK
    assert datetime.fromisoformat(response.json["active_to"]) == datetime.fromisoformat("2024-03-04T00:00:00-08:00")


def test_add_special_field_one_day_after_existing_entry(client, auth_header):
    """An entry added the day after an existing one leaves that one covering its single day."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    first = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "first", "2024-02-05")
    )

    response = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "second", "2024-02-06")
    )

    assert response.status_code == HTTPStatus.CREATED
    assert response.json["active_to"] is None
    entries = _assert_history_loads(client, auth_header, proponent.id, 2)
    stored_first = next(entry for entry in entries if entry["id"] == first.json["id"])
    assert datetime.fromisoformat(stored_first["active_to"]) == datetime.fromisoformat("2024-02-06T00:00:00-08:00")


def test_add_special_field_on_the_same_day_as_existing_entry_is_rejected(client, auth_header):
    """Two entries cannot start on the same day."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "first", "2024-02-05"))

    response = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "second", "2024-02-05T18:00:00-08:00")
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    _assert_history_loads(client, auth_header, proponent.id, 1)


def test_update_special_field_keeps_adjacent_day_entries(client, auth_header):
    """Updating an entry does not empty a neighbour that starts the day before another entry."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    ids = {}
    for value, active_from in [
        ("first", "2024-01-05T00:00:00-08:00"),
        ("third", "2024-02-05T00:00:00-08:00"),
        ("second", "2024-02-04T00:00:00-08:00"),
    ]:
        response = client.post(
            url, headers=auth_header, json=_proponent_name_entry(proponent.id, value, active_from)
        )
        ids[value] = response.json["id"]

    response = client.put(
        urljoin(API_BASE_URL, f"special-fields/{ids['third']}"), headers=auth_header,
        json=_proponent_name_entry(proponent.id, "third renamed", "2024-02-05T00:00:00-08:00"),
    )

    assert response.status_code == HTTPStatus.OK
    _assert_history_loads(client, auth_header, proponent.id, 3)


def test_special_field_start_is_normalised_to_pacific_midnight(client, auth_header):
    """The server decides the start instant: Pacific midnight of the day sent.

    A plain date is taken as that day. A datetime (older clients) is read as the Pacific day
    it falls on, so the browser's timezone and time of day are not stored.
    """
    url = urljoin(API_BASE_URL, "special-fields")
    cases = [
        ("2024-01-10", "2024-01-10T00:00:00-08:00"),
        ("2024-07-10", "2024-07-10T00:00:00-07:00"),
        ("2024-02-04T15:30:45-08:00", "2024-02-04T00:00:00-08:00"),
        ("2024-03-05T07:59:00Z", "2024-03-04T00:00:00-08:00"),
    ]
    for sent, expected in cases:
        proponent = factory_proponent_model()
        response = client.post(
            url, headers=auth_header, json=_proponent_name_entry(proponent.id, "name", sent)
        )
        assert response.status_code == HTTPStatus.CREATED, sent
        assert datetime.fromisoformat(response.json["active_from"]) == datetime.fromisoformat(expected), sent


def test_special_field_update_normalises_start(client, auth_header):
    """An update goes through the same normalisation as a create."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    created = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "name", "2024-01-10")
    )

    response = client.put(
        urljoin(API_BASE_URL, f"special-fields/{created.json['id']}"), headers=auth_header,
        json=_proponent_name_entry(proponent.id, "name", "2024-01-12T13:00:00-08:00"),
    )

    assert response.status_code == HTTPStatus.OK
    assert datetime.fromisoformat(response.json["active_from"]) == datetime.fromisoformat("2024-01-12T00:00:00-08:00")


def test_special_field_rejects_a_start_that_is_not_a_date(client, auth_header):
    """Anything that is not a date or a datetime with an offset is a 400."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    for sent in [
        "not a date", "2024-13-40", "2024-01-10T00:00:00", 20240110, None,
        "9999-12-31T23:59:59-12:00", "0001-01-01T00:00:00+14:00",
    ]:
        response = client.post(
            url, headers=auth_header, json=_proponent_name_entry(proponent.id, "name", sent)
        )
        assert response.status_code == HTTPStatus.BAD_REQUEST, sent


def test_special_field_response_carries_the_pacific_day(client, auth_header):
    """The API says which day an entry starts and ends on, so the browser never has to work it out."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    first = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "first", "2024-01-10")
    )
    second = client.post(
        url, headers=auth_header, json=_proponent_name_entry(proponent.id, "second", "2024-07-10")
    )

    assert first.json["active_from_day"] == "2024-01-10"
    assert second.json["active_from_day"] == "2024-07-10"
    assert second.json["active_to_day"] is None
    entries = {entry["id"]: entry for entry in _assert_history_loads(client, auth_header, proponent.id, 2)}
    assert entries[first.json["id"]]["active_from_day"] == "2024-01-10"
    assert entries[first.json["id"]]["active_to_day"] == "2024-07-09"


def test_special_field_day_is_the_pacific_day_of_a_stored_time(client, auth_header):
    """An entry written with a time of day reports the Pacific day that instant falls on."""
    proponent = factory_proponent_model()
    # 05:00 UTC on the 2nd is still the evening of the 1st in Pacific time
    factory_special_field_model(
        _proponent_name_entry(proponent.id, "evening", datetime.fromisoformat("2024-03-02T05:00:00+00:00"))
    )

    entries = _assert_history_loads(client, auth_header, proponent.id, 1)

    assert entries[0]["active_from_day"] == "2024-03-01"


def test_delete_entry_after_a_one_day_entry(client, auth_header):
    """The entry after a deleted one takes over the deleted entry's start, leaving no day uncovered."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "a", "2024-02-04"))
    middle = client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "b", "2024-02-05"))
    last = client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "c", "2024-03-01"))

    response = client.delete(urljoin(API_BASE_URL, f"special-fields/{middle.json['id']}"), headers=auth_header)

    assert response.status_code in (HTTPStatus.OK, HTTPStatus.NO_CONTENT)
    entries = {entry["id"]: entry for entry in _assert_history_loads(client, auth_header, proponent.id, 2)}
    assert entries[last.json["id"]]["active_from"] == middle.json["active_from"]


def test_delete_entry_between_entries_further_apart(client, auth_header):
    """Deleting a middle entry still hands its start to the next entry when no entries are adjacent."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "a", "2024-01-04"))
    middle = client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "b", "2024-02-05"))
    last = client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "c", "2024-03-01"))

    client.delete(urljoin(API_BASE_URL, f"special-fields/{middle.json['id']}"), headers=auth_header)

    entries = {entry["id"]: entry for entry in _assert_history_loads(client, auth_header, proponent.id, 2)}
    assert entries[last.json["id"]]["active_from"] == middle.json["active_from"]


def test_update_keeps_a_stored_time_when_the_day_is_unchanged(client, auth_header):
    """Editing only the value of an entry stored with a time of day does not move its start."""
    proponent = factory_proponent_model()
    stored_start = datetime.fromisoformat("2024-02-05T10:00:00-08:00")
    entry = factory_special_field_model(_proponent_name_entry(proponent.id, "created", stored_start))

    response = client.put(
        urljoin(API_BASE_URL, f"special-fields/{entry.id}"), headers=auth_header,
        json=_proponent_name_entry(proponent.id, "renamed", "2024-02-05"),
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json["field_value"] == "renamed"
    assert datetime.fromisoformat(response.json["active_from"]) == stored_start


def test_update_current_entry_after_adding_one_on_its_day(client, auth_header):
    """An entry stored with a time of day can still be edited after another is added on its day."""
    url = urljoin(API_BASE_URL, "special-fields")
    proponent = factory_proponent_model()
    stored_start = datetime.fromisoformat("2024-02-05T10:00:00-08:00")
    current = factory_special_field_model(_proponent_name_entry(proponent.id, "created", stored_start))
    client.post(url, headers=auth_header, json=_proponent_name_entry(proponent.id, "added", "2024-02-05"))

    response = client.put(
        urljoin(API_BASE_URL, f"special-fields/{current.id}"), headers=auth_header,
        json=_proponent_name_entry(proponent.id, "renamed", "2024-02-05"),
    )

    assert response.status_code == HTTPStatus.OK
    assert datetime.fromisoformat(response.json["active_from"]) == stored_start
    assert response.json["active_to"] is None
    _assert_history_loads(client, auth_header, proponent.id, 2)
