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

"""Common setup and fixtures for the py-test suite used by this service."""
import os
import pytest
from flask import g
from flask_migrate import Migrate, upgrade
from sqlalchemy import event, text
from sqlalchemy.orm import scoped_session, sessionmaker

from api import create_app
from api import jwt as _jwt
from api.models import Project, Staff
from api.models import db as _db
from api.services import EventTemplateService
from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header


@pytest.fixture(scope="session", autouse=True)
def app():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")
    with _app.app_context():
        yield _app
        _db.session.remove()


@pytest.fixture(scope="function")
def app_request():
    """Return a session-wide application configured in TEST mode."""
    _app = create_app("testing")

    return _app


@pytest.fixture(scope="session")
def client(app):  # pylint: disable=redefined-outer-name
    """Return a session-wide Flask test client."""
    return app.test_client()


@pytest.fixture(scope="session")
def jwt(app):
    """Return session-wide jwt manager."""
    return _jwt


@pytest.fixture(scope="session")
def client_ctx(app):
    """Return session-wide Flask test client."""
    with app.test_client() as _client:
        yield _client


@pytest.fixture(scope='session')
def db(app):  # pylint: disable=redefined-outer-name, invalid-name
    """Return a session-wide initialised database.

    Drops schema, and recreate.
    """
    with app.app_context():
        g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
        drop_schema_sql = text("""DROP SCHEMA public CASCADE;
                                    CREATE SCHEMA public;
                                    GRANT ALL ON SCHEMA public TO postgres;
                                    GRANT ALL ON SCHEMA public TO public;
                                 """)

        sess = _db.session()
        sess.execute(drop_schema_sql)
        sess.commit()

        Migrate(app, _db)
        upgrade()

        _load_templates()

        return _db


def _load_templates():
    # Call the import_events_template method after database setup to populate init data
    templates_folder = os.path.join(os.path.dirname(__file__), '../../epictrack-api/src/api/templates/event_templates')
    g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
    for root, dirs, files in os.walk(templates_folder):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            thread = EventTemplateService.import_events_template(file_path)
            thread.join()


@pytest.fixture(scope="session")
def docker_compose_files(pytestconfig):
    """Get the docker-compose.yml absolute path."""
    import os

    return [
        os.path.join(str(pytestconfig.rootdir), "tests/docker", "docker-compose.yml")
    ]


@pytest.fixture(scope="function")
def new_project():
    """Create new project."""
    project = Project(
        **{
            "name": "New Project",
            "description": "Testing the create project endpoint",
            "latitude": "54.2681",
            "longitude": "-130.3828",
            "type_id": 1,
            "sub_type_id": 1,
            "proponent_id": 1,
            "region_id_env": 1,
            "region_id_flnro": 1,
        }
    )
    project = project.save()
    return project


@pytest.fixture(scope="function")
def new_staff():
    """Create new staff."""
    staff = Staff(
        **{
            "first_name": "Andrew",
            "last_name": "Drew",
            "phone": "1111111111",
            "email": "andrew@test.com",
            "position_id": 3,
        }
    )
    # staff = staff.save()
    _db.session.add(staff)
    _db.session.commit()

    return staff


@pytest.fixture(scope="function", autouse=True)
def session(app, db):
    """Return a function-scoped session."""
    with app.app_context(), db.engine.connect() as conn:
        conn.begin()
        session_factory = sessionmaker(bind=conn)
        sess = scoped_session(session_factory)
        sess.begin_nested()

        @event.listens_for(sess(), 'after_transaction_end')
        def restart_savepoint(sess2, trans):
            if trans.nested and not trans._parent.nested:
                sess2.expire_all()
                sess.begin_nested()

        db.session = sess

        sql = text('select 1')
        sess.execute(sql)

        yield sess


@pytest.fixture()
def auth_header(client, jwt, request):
    """Create a basic admin header for tests."""
    staff_user = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    return headers
