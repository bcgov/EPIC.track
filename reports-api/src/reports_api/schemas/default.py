"""Schema representing default validation"""


class DefaultSchema:  # pylint: disable=too-few-public-methods
    """Schema representing default validation"""

    @staticmethod
    def validate(data):
        """Method to validate the given data"""
        if data:
            return True
        return {"error": "No data submitted"}
