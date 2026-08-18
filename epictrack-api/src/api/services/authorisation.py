"""The Authorization service.

This module is to handle authorization related queries.
"""

from contextlib import contextmanager

from flask import g
from flask_restx import abort

from api.utils import TokenInfo
from api.utils.roles import Membership, ElevatedRole, Role
from api.models import Staff as StaffModel
from api.models import StaffElevatedRole as StaffElevatedRoleModel
from api.models import StaffWorkRole as StaffWorkRoleModel


@contextmanager
def action_context():
    """Run a block of code as a side effect of an already authorized operation.

    Event actions (see `api.actions`) cascade through services that each run their
    own check. The user's right to trigger the cascade is checked once, against the work
    the event belongs to; the cascade itself acts on the system's behalf and can
    reach records the user has no standalone permission on, such as a work the action
    itself creates.
    """
    previous = getattr(g, "in_action_context", False)
    g.in_action_context = True
    try:
        yield
    finally:
        g.in_action_context = previous


# pylint: disable=unused-argument,inconsistent-return-statements
def check_auth(**kwargs):
    """Check if user is authorized to perform action on the service."""
    if getattr(g, "in_action_context", False):
        return True

    raw_roles = kwargs.get("one_of_roles", [])
    work_id = kwargs.get("work_id")
    permitted_roles = {_normalize_role(r) for r in raw_roles}

    token_roles = set(TokenInfo.get_roles())
    if token_roles & permitted_roles:
        return True

    membership_values = {m.value for m in Membership}
    matching_memberships = membership_values & permitted_roles
    if matching_memberships and _has_team_membership(work_id, matching_memberships):
        return True

    if permitted_roles and _has_elevated_role(permitted_roles):
        return True

    abort(403)


def _normalize_role(role):
    if isinstance(role, (Role, Membership, ElevatedRole)):
        return role.value
    return role


def _has_elevated_role(permitted_roles) -> bool:
    email = TokenInfo.get_user_data()["email_id"]
    staff_model: StaffModel = StaffModel.find_by_email(email)
    if not staff_model:
        return False

    elevated_roles = StaffElevatedRoleModel.find_by_params({"staff_id": staff_model.id})
    if not elevated_roles:
        return False

    return any(role.elevated_role_id in permitted_roles for role in elevated_roles)


def _has_team_membership(work_id, team_permitted_roles) -> bool:
    if not work_id:
        return False

    email = TokenInfo.get_user_data()["email_id"]
    staff_model: StaffModel = StaffModel.find_by_email(email)
    if not staff_model:
        return False

    work_roles = StaffWorkRoleModel.find_by_params(
        {"work_id": work_id, "staff_id": staff_model.id}
    )
    if not work_roles:
        return False

    if Membership.TEAM_MEMBER.value in team_permitted_roles:
        return True

    membership_ids = {m.value for m in Membership}

    return any(work_role.role_id in membership_ids for work_role in work_roles)
