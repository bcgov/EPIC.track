"""Custom JSON Encoder to handle date conversion"""
from datetime import date, datetime
from json import JSONEncoder


# pylint:disable=too-few-public-methods,invalid-name
class CustomJSONEncoder(JSONEncoder):
    """Custom JSON Encoder"""

    def default(self, o):
        """Override the default encoding of date/datetime"""
        if isinstance(o, (date, datetime)):
            return o.isoformat()
        return super().default(o)
