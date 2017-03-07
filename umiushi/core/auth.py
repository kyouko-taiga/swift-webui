from functools import wraps

from flask import current_app, request, session
from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from umiushi.core.db.models import User
from umiushi.core.exc import InvalidTokenError


def parse_auth_token():
    """
    Return the authenticated user associated with the current request.

    The function first tries to get the authenticated user from the session
    object. It that fails, it looks for `Auth-Token` in the request headers.
    If no token can be found in either of these locations, or if the found
    token is invalid or expired, the function returns `None`.
    """
    if 'Auth-Token' in session:
        return User.query.filter(User.login == session['Auth-Token']).one_or_none()

    if 'Auth-Token' in request.headers:
        try:
            auth = signer.unsign(auth_token, max_age=current_app.config['AUTH_TOKEN_DURATION'])
        except (BadSignature, SignatureExpired):
            return None
        return User.query.filter(User.login == auth.decode()).one_or_none()

    return None


def require_auth(f):
    """
    A decorator that is used on views to ensure that the request is made by
    by an authenticated. The decorated request handler is called with an
    additional `auth` containing authenticated user.

    .. note::
        The decorator raises :class:`InvalidTokenError` and does not call the
        decorated function if no authentication token could be parsed from the
        request.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = parse_auth_token()
        if auth is None:
            raise InvalidTokenError()

        kwargs['auth'] = auth
        return f(*args, **kwargs)

    return wrapper
