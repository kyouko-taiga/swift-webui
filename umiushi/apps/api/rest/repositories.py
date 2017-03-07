import hashlib
import magic
import os
import requests
import shlex
import subprocess
import sys

from flask import Blueprint, abort, current_app, send_file
from flask import request as flask_request
from werkzeug.security import safe_join

from umiushi.core.auth import require_auth
from umiushi.core.utils.responses import jsonify_list

from ..exc import ApiError


bp = Blueprint('repository', __name__)


@bp.route('/repositories/')
@require_auth
def list_repositories(auth):
    """
    .. http:get:: /repositories/

        Return the list of repositories belonging to the authenticated user.

        :return:
            A list of repositories.
    """
    resp = requests.get(
        'https://api.github.com/user/repos',
        headers={
            'Accept':        'application/vnd.github.v3+json',
            'Authorization': 'token ' + auth.access_token,
            'User-Agent':    current_app.config['APPLICATION_NAME'],
        })

    resp.raise_for_status()
    return jsonify_list(resp.json())


@bp.route('/repositories/<repository_name>/')
@require_auth
def list_files(auth, repository_name):
    """
    .. http:get:: /repositories/(repository_name)

        Return the list of files in the given repository.

        Note that the user should have pull and push permissions on the
        repository, otherwise HTTP 403 will be returned.

        :return:
            A list of files.
    """

    # Clone the repository if necessary.
    repository_path = safe_join(auth.home, repository_name)
    if not os.path.exists(repository_path):
        resp = requests.get(
            'https://api.github.com/repos/%(owner)s/%(repository)s' % {
                'owner':      auth.login,
                'repository': repository_name,
            },
            headers={
                'Accept':        'application/vnd.github.v3+json',
                'Authorization': 'token ' + auth.access_token,
                'User-Agent':    current_app.config['APPLICATION_NAME'],
            })

        resp.raise_for_status()
        repository = resp.json()

        # Check the permissions of the repository.
        if not repository['permissions']['pull'] or not repository['permissions']['push']:
            abort(403)

        # FIXME: Replace https with ssh
        command_line = (
            'git clone https://github.com/%(owner)s/%(repository)s.git %(repository_path)s' % {
                'owner':           auth.login,
                'repository':      repository_name,
                'repository_path': repository_path,
            })

        clone = subprocess.run(
            shlex.split(command_line), stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if clone.returncode != 0:
            print(clone.stderr.decode(), file=sys.stderr, end='')
            abort(500)

    # List all files from the repository.
    files = []
    for dirname, _, filenames in os.walk(repository_path):
        for filename in filenames:
            file_path = os.path.join(dirname, filename)

            # Try to identify the mime type of the file.
            mimetype = magic.from_file(file_path, mime=True)
            if mimetype.split('/')[0] == 'text':
                _, extension = os.path.splitext(file_path)
                mimetype = current_app.config['FILE_EXTENSIONS'].get(extension, mimetype)

            files.append({
                'path':     os.path.relpath(os.path.join(dirname, filename), repository_path),
                'mimetype': mimetype,
                'sha':      checksum(file_path),
            })

    return jsonify_list(files)


@bp.route('/repositories/<repository_name>/<path:file_path>')
@require_auth
def get_file(auth, repository_name, file_path):
    """
    .. http:get:: /repositories/(repository_name)/(file_path)

        Return the content of the file at the given path.

        :return:
            The content of the file.
    """
    repository_path = safe_join(auth.home, repository_name)
    file_path = safe_join(repository_path, file_path)
    if not os.path.exists(file_path):
        abort(404)

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] and not flask_request.is_xhr:
        mimetype = magic.from_file(file_path, mime=True)
    else:
        mimetype = None

    return send_file(file_path, mimetype=mimetype)


def checksum(file_path):
    h = hashlib.sha256()

    with open(file_path, 'rb') as f:
        block = f.read(4096)
        while len(block) > 0:
            h.update(block)
            block = f.read(4096)

    return h.hexdigest()
