"""SQL Alchemy helper function to generate UTC time"""
from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import DateTime


class utcnow(expression.FunctionElement):  # pylint: disable=invalid-name,too-many-ancestors # noqa: N801
    """sqlalchemy function to generate UTC time"""

    type = DateTime()
    inherit_cache = True


@compiles(utcnow, "postgresql")
def pg_utcnow(element, compiler, **kw):  # pylint: disable=unused-argument
    """Compiles UTC time for Postgres"""
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"
