from datetime import timedelta

from marshmallow import EXCLUDE, Schema, fields


class EventCalendarSchema(Schema):
    start_date = fields.DateTime()
    end_date = fields.Method("get_end_date")
    name = fields.Str()
    link = fields.URL()
    project = fields.Str()
    project_description = fields.Str()
    project_address = fields.Str()
    project_short_code = fields.Str()
    phase = fields.Str()
    color = fields.Str()
    work_type = fields.Str()
    id = fields.Int()

    class Meta:
        unknown = EXCLUDE

    def get_end_date(self, obj):
        return obj.start_date + timedelta(days=obj.duration)
