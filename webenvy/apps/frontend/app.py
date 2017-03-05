from functools import wraps

from flask import Blueprint, current_app, redirect, render_template, session, url_for
from itsdangerous import TimestampSigner

from webenvy.core.auth import parse_auth_token


bp = Blueprint('app', __name__)


def redirect_unauthenticated(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = parse_auth_token()
        if auth is None:
            return redirect(url_for('auth.login'))

        kwargs['auth'] = auth
        return f(*args, **kwargs)

    return wrapper


@bp.route('/', defaults={'path': None})
@bp.route('/<path:path>')
@redirect_unauthenticated
def index(path, auth):
    """
    A catch-all route that serves the single page application.

    .. note::
        There's a risk that this route may conflict with other routes. The
        route ordering is performed by werkzeug in a function called
        :func:`werkzeug.routing.Route.match_compare_key`. The ordering is
        the following:

        * Static routes always have top priority.
        * For dynamic routes, the more complex it is the more priority it has.
        * For routes with the same complexity, it compares the different parts
          in the route from left to right. Static parts always have an higher
          priority and some type of dynamic patterns have more priority than
          others (ie: integer has more than path).

        The ordering on the patterns is given by the weight of its converter,
        as illustrated in :class:`werkzeug.routing.PathConverter`.
    """
    signer = TimestampSigner(current_app.secret_key)
    return render_template(
        'app.html',
        auth_token=signer.sign(session['Auth-Token']).decode())
