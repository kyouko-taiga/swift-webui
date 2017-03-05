import errno
import os
import requests
import urllib.request
import uuid

from flask import Blueprint, abort, current_app, redirect, session, url_for
from flask import request as flask_request
from itsdangerous import URLSafeSerializer

from webenvy.core.db import db_session
from webenvy.core.db.models import User


bp = Blueprint('auth', __name__)


@bp.route('/login')
def login():
    # Generate a CSRF token.
    serializer = URLSafeSerializer(current_app.secret_key)

    # Start the OAuth dance.
    return redirect(
        'https://github.com/login/oauth/authorize?'
        'state=%(state)s&scope=%(scope)s&client_id=%(client_id)s' % {
            'client_id': current_app.config['APPLICATION_ID'],
            'state':     serializer.dumps(str(uuid.uuid4())),
            'scope':     urllib.request.quote('user:email write:public_key'),
        })


@bp.route('/logout')
def logout():
    del session['Auth-Token']
    return redirect('http://www.unige.ch/sciences/')


@bp.route('/register')
def register():
    # Validate the state token to prevent cross-site request forgery attacks.
    serializer = URLSafeSerializer(current_app.secret_key)
    state = serializer.loads(flask_request.args.get('state'))

    # Exchange github's code for an access token.
    resp = requests.post(
        'https://github.com/login/oauth/access_token',
        headers={
            'Accept':        'application/json',
            'User-Agent':    current_app.config['APPLICATION_NAME'],
        },
        json={
            'client_id':     current_app.config['APPLICATION_ID'],
            'client_secret': current_app.config['APPLICATION_SECRET'],
            'state':         flask_request.args.get('state'),
            'code':          flask_request.args.get('code'),
        })

    resp.raise_for_status()
    token = resp.json()
    if 'access_token' not in token:
        abort(403)

    # Fetch the authenticated user's data from github.
    resp = requests.get(
        'https://api.github.com/user',
        headers={
            'Accept':        'application/vnd.github.v3+json',
            'Authorization': 'token ' + token['access_token'],
            'User-Agent':    current_app.config['APPLICATION_NAME'],
        })

    resp.raise_for_status()
    user_data = resp.json()

    # Insert a new user into the local database, or update the existing one.
    user = User.query.filter(User.login == user_data['login']).one_or_none()
    if user is None:
        user = User(login=user_data['login'])
        user.home = os.path.join(current_app.config['DATA_ROOT'], user.login)
        db_session.add(user)
        db_session.flush()

    user.access_token = token['access_token']
    user.avatar_url = user_data.get('avatar_url')
    db_session.commit()

    # Make sure there's a directory for the freshly fetched user.
    try:
        os.makedirs(user.home)
    except OSError as error:
        if error.errno != errno.EEXIST:
            raise

    # Save the user login in the session.
    session['Auth-Token'] = user.login
    return redirect(url_for('app.index'))
