"""This module contains signals, which intercept specific database actions and perform operations as needed."""
from flask import g
from sqlalchemy import event

from reports_api.models.db import db


@event.listens_for(db.session, "before_commit")
def before_commit(session):
    """Listens to the before commit event and updates the created_by/updated_by fields"""
    new_objects = session.new
    updated_objects = session.dirty
    for new_object in new_objects:
        setattr(new_object, 'created_by', g.jwt_oidc_token_info.get('name', None) or g.jwt_oidc_token_info.get('email'))

    for updated_object in updated_objects:
        setattr(updated_object, 'updated_by', g.jwt_oidc_token_info.get(
            'name', None) or g.jwt_oidc_token_info.get('email'))
