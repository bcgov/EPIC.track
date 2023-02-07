"""Custom JSON Encoder to handle date conversion"""
from datetime import date, datetime

from flask.json import JSONEncoder


class CustomJSONEncoder(JSONEncoder):
    """Custom JSON Encoder"""

    def default(self, o):
        """Override the default encoding of date/datetime"""
        if isinstance(o, (date, datetime)):
            return o.isoformat()
        return super().default(o)
