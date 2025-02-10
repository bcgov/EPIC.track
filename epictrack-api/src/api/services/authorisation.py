"""The Authorization service.

This module is to handle authorization related queries.
"""

from flask_restx import abort

from api.utils import TokenInfo
from api.utils.roles import Membership
from api.models import Staff as StaffModel
from api.models import StaffWorkRole as StaffWorkRoleModel


# pylint: disable=unused-argument,inconsistent-return-statements
def check_auth(**kwargs):
    """Check if user is authorized to perform action on the service."""
    token_roles = set(TokenInfo.get_roles())
    permitted_roles = set(kwargs.get('one_of_roles', []))
    has_valid_roles = token_roles & permitted_roles
    if has_valid_roles:
        return

    matching_memberships = {membership.name for membership in Membership} & permitted_roles

    if matching_memberships and _has_team_membership(kwargs, matching_memberships):
        return True

    abort(403)


def _has_team_membership(kwargs, team_permitted_roles) -> bool:
    work_id = kwargs.get('work_id')

    if not work_id:
        return False

    email = TokenInfo.get_user_data()['email_id']
    staff_model: StaffModel = StaffModel.find_by_email(email)

    work_roles = StaffWorkRoleModel.find_by_params(
        {"work_id": work_id, "staff_id": staff_model.id}
    )
    if not work_roles:
        return False

    if Membership.TEAM_MEMBER.value in team_permitted_roles:
        return bool(work_roles)

    membership_ids = {membership.value for membership in Membership}

    return any(work_role.role_id in membership_ids for work_role in work_roles)
