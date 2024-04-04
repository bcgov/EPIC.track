"""Contains custom providers for Faker"""
from faker import Faker
from faker.providers import BaseProvider


fake = Faker()


# Created to avoid errors due to inconsistent formatting by default provider.
class FormattedPhoneNumberProvider(BaseProvider):
    """Create a phone number formatted '(xxx) xxx-xxxx"""

    def formatted_phone_number(self) -> str:
        """Create a phone number formatted '(xxx) xxx-xxxx"""
        area_code = fake.random_number(digits=3, fix_len=True)
        part1 = fake.random_number(digits=3, fix_len=True)
        part2 = fake.random_number(digits=4, fix_len=True)
        return f"({area_code}) {part1}-{part2}"
