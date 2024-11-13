"""This module contains signals, which intercept specific database actions and perform operations as needed."""

from flask import current_app, g
from sqlalchemy import event

from api.models.db import db


@event.listens_for(db.session, "before_commit")
def before_commit(session, *args):  # pylint: disable=unused-argument
    """Listens to the  and updates the created_by/updated_by fields"""
    new_objects = session.new
    updated_objects = session.dirty
    username = (
        getattr(g, "jwt_oidc_token_info", {}).get("preferred_username")
        or getattr(g, "jwt_oidc_token_info", {}).get("email")
        or "system"
    )
    current_app.logger.info("Before commit event. Updating created/updated by")
    current_app.logger.info(f"Preferred username is {username}")

    if username is None:
        username = g.jwt_oidc_token_info.get("email")
    for new_object in new_objects:
        setattr(new_object, "created_by", username)
    for updated_object in updated_objects:
        setattr(updated_object, "updated_by", username)
