"""Schema representing default validation"""


from dataclasses import dataclass


@dataclass
class DefaultSchema:  # pylint: disable=too-few-public-methods
    """Schema representing default validation"""

    data: dict

    @classmethod
    def from_dict(cls, data: dict) -> dict:
        """Return a valid DefaultSchema from a dictionary."""
        return cls(**{'data': data})

    def validate(self):
        """Method to validate the given data"""
        if self.data:
            return True
        return {"error": "No data submitted"}
