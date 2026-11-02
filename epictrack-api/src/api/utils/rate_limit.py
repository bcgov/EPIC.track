"""Per-user rate limiting.

Limits are keyed on the caller, not the client IP: staff reach the API through shared
government NAT/proxies, so an IP key would put a whole office in one bucket.
"""
import hashlib

from flask import current_app, g, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


def _caller_key():
    """Return the rate limit key for the current request.

    Route limits run inside ``auth.require`` and use the verified token subject. Default
    limits run before authentication, so they fall back to a hash of the bearer token
    (a forged token only gets its own bucket and is rejected with 401 anyway).
    """
    token_info = getattr(g, 'token_info', None)
    if token_info and token_info.get('sub'):
        return f"user:{token_info['sub']}"
    # Hash only the token: auth accepts any case/spacing of "Bearer", which must not open new buckets.
    token = request.headers.get('Authorization', '').split()[-1:]
    if token:
        return f"token:{hashlib.sha256(token[0].encode()).hexdigest()}"
    return f"ip:{get_remote_address()}"


limiter = Limiter(key_func=_caller_key, default_limits=[lambda: current_app.config['RATE_LIMIT_DEFAULT']])


@limiter.request_filter
def _exempt_request():
    """Skip limits when disabled for the app and for CORS preflights."""
    return not current_app.config.get('RATE_LIMITS_ENABLED', True) or request.method == 'OPTIONS'


def import_limit():
    """Limit for bulk spreadsheet imports."""
    return current_app.config['RATE_LIMIT_IMPORT']


def report_limit():
    """Limit for report generation."""
    return current_app.config['RATE_LIMIT_REPORT']


def lookup_limit():
    """Limit for existence/lookup checks that could be used for enumeration."""
    return current_app.config['RATE_LIMIT_LOOKUP']
