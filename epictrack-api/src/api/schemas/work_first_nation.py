"""Work first nation schema"""
from marshmallow import Schema, fields

from api.models.indigenous_work import IndigenousWork


class WorkFirstNationSchema(Schema):
    """Work first nation schema"""

    nation = fields.Method("get_nation")
    pin = fields.Method("get_pin")
    relationship_holder = fields.Method("get_relationship_holder")
    pip_link = fields.Method("get_pip_link")
    active = fields.Method("get_active_status")

    def get_nation(self, instance: IndigenousWork) -> str:
        """Return the name of first nation"""
        return instance.indigenous_nation.name

    def get_pin(self, instance: IndigenousWork) -> str:
        """Return PIN status of first nation work"""
        return instance.pin

    def get_relationship_holder(self, instance: IndigenousWork) -> str:
        """Return relationship holder name of first nation"""
        if instance.indigenous_nation.relationship_holder:
            return instance.indigenous_nation.relationship_holder.full_name
        return ""

    def get_pip_link(self, instance: IndigenousWork) -> str:
        """Return PIP link of first nation"""
        return instance.indigenous_nation.pip_link

    def get_active_status(self, instance: IndigenousWork) -> str:
        """Return active status of first nation work"""
        return "Active" if instance.is_active else "Inactive"
