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
"""Create SQLAlchenmy and Schema managers.

These will get initialized by the application using the models
"""
import os
from contextlib import contextmanager
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import create_engine
from api.config import get_named_config
from sqlalchemy.orm import scoped_session, sessionmaker

from api.models.history import versioned_session


# by convention in the Flask community these are lower case,
# whereas pylint wants them upper case
db = SQLAlchemy()  # pylint: disable=invalid-name
ma = Marshmallow()

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    # Using the default session for the scope
    session = sessionmaker(autocommit=False, autoflush=False, bind=db.engine)
    # try:
    #     yield session
    #     session.commit()
    # except Exception as e:  # noqa: B901, E722
    #     print(str(e))
    #     # session.rollback()
    #     raise
    return session
versioned_session(db.session)
