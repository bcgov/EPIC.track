"""SQL Alchemy helper function to generate UTC time"""
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import expression
from sqlalchemy.types import DateTime


# pylint: disable=invalid-name,too-many-ancestors,abstract-method


class utcnow(expression.FunctionElement):  # noqa: N801
    """sqlalchemy function to generate UTC time"""

    type = DateTime()
    inherit_cache = True


@compiles(utcnow, "postgresql")
def pg_utcnow(element, compiler, **kw):  # pylint: disable=unused-argument
    """Compiles UTC time for Postgres"""
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"
