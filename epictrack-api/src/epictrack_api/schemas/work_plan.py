"""Work plan schema"""
from datetime import timedelta
from marshmallow import Schema, fields


class WorkPlanSchema(Schema):
    """Work plan schema"""

    name = fields.Str()
    type = fields.Method("get_type")
    start_date = fields.Method("get_start_date")
    end_date = fields.Method("get_end_date")
    days = fields.Method("get_days")
    assigned = fields.Method("get_assignee")
    responsibility = fields.Method("get_responsibility")
    notes = fields.Method("get_notes")
    progress = fields.Method("get_progress")

    def get_type(self, instance):  # pylint: disable=unused-argument
        """Return the type of event"""
        return self.context["type"].title()

    def get_start_date(self, instance):
        """Return event start date"""
        from_date = instance.start_date if hasattr(instance, "start_date") else instance.anticipated_date
        if hasattr(instance, "actual_date") and instance.actual_date:
            from_date = instance.actual_date
        return from_date

    def get_end_date(self, instance):
        """Return event end date"""
        from_date = instance.start_date if hasattr(instance, "start_date") else instance.anticipated_date
        if hasattr(instance, "actual_date") and instance.actual_date:
            from_date = instance.actual_date
        end_date = from_date + timedelta(days=instance.number_of_days)
        return end_date

    def get_days(self, instance):
        """Return duration of the event"""
        return instance.number_of_days or 1

    def get_assignee(self, instance):
        """Return the assignee details"""
        assignees = getattr(instance, "assignees", None)
        if assignees:
            assignee_names = [x.assignee.full_name for x in assignees]
            assignee_names = sorted(assignee_names)
            assignees = "; ".join(assignee for assignee in assignee_names)
        return assignees

    def get_responsibility(self, instance):
        """Return the responsibility"""
        responsibility = getattr(instance, "responsibility", None)
        if responsibility:
            return responsibility.name
        return None

    def get_progress(self, instance):
        """Return the event progress"""
        status_dict = {
            "NOT_STARTED": "Not Started",
            "INPROGRESS": "In Progress",
            "COMPLETED": "Completed"
        }
        if hasattr(instance, "actual_date") and instance.actual_date is None:
            return "Not Started"
        if hasattr(instance, "actual_date") and instance.actual_date:
            return "Completed"
        if hasattr(instance, "status"):
            return status_dict.get(instance.status.value)
        return ""

    def get_notes(self, instance):
        """Return notes"""
        notes = getattr(instance, "notes", "")
        return notes
