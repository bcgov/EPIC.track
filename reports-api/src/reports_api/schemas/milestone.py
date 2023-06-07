"""Milestone model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Milestone, MilestoneType, Outcome
from reports_api.schemas.base import AutoSchemaBase


class MilestoneTypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Milestone type model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = MilestoneType
        unknown = EXCLUDE


class OutcomeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Indigenous nation schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Outcome
        include_fk = True
        unknown = EXCLUDE

    milestone = fields.Nested("MilestoneSchema", dump_only=True, exclude=("outcomes",))


class MilestoneSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Milestone model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Milestone
        include_fk = True
        unknown = EXCLUDE

    milestone_type = fields.Nested(MilestoneTypeSchema, dump_only=True)
    outcomes = fields.Nested(
        OutcomeSchema(many=True), exclude=("milestone",), dump_only=True
    )
