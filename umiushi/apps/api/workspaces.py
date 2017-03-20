import docker
import hashlib
import magic
import os
import shutil
import time

from flask import Blueprint, abort, current_app, jsonify, request, send_file
from itsdangerous import JSONWebSignatureSerializer
from werkzeug.security import safe_join

from umiushi.core.auth import require_auth
from umiushi.core.db import db_session
from umiushi.core.db.models import Workspace
from umiushi.core.utils.responses import jsonify_list

from .exc import ApiError


bp = Blueprint('workspace', __name__)


@bp.route('/workspaces/')
@require_auth
def list_workspaces(auth):
    """
    .. http:get:: /workspaces/

        Return the list of workspaces belonging to the authenticated user.

        :return:
            A list of workspaces.
    """
    return jsonify_list([workspace.to_dict() for workspace in auth.workspaces])


@bp.route('/workspaces/', methods=['POST'])
@require_auth
def create_workspace(auth):
    workspace_data = request.get_json(force=True)

    # Check for duplicate names.
    workspace_id = workspace_data.get('name')
    if any(wk.name == workspace_id for wk in auth.workspaces):
        raise ApiError('duplicate name')

    # Create a new workspace.
    user_root = os.path.join(current_app.config['DATA_ROOT_URL'], auth.login)
    workspace = Workspace(
        owner    = auth,
        name     = workspace_id,
        language = workspace_data.get('language'))

    db_session.add(workspace)
    db_session.flush()

    workspace.root_url = safe_join(user_root, workspace.name)
    os.makedirs(workspace.root_url)
    db_session.commit()

    return jsonify(workspace.to_dict()), 201


@bp.route('/workspaces/<workspace_id>')
@require_auth
def get_workspace(auth, workspace_id):
    workspace = fetch_workspace(auth, workspace_id)

    client = docker.from_env()
    if not client.ping():
        abort(500)

    # Make sure the shell container is up and running, or created otherwise.
    try:
        shell_container = client.containers.get(workspace.shell_container)
        if shell_container.status in ['paused', 'exited']:
            shell_container.restart()

    except (docker.errors.NullResource, docker.errors.NotFound):
        # Create the docker image associated with the workspace's language.
        image_path = current_app.config['DOCKER_IMAGES'].get(workspace.language)
        image = client.images.build(path=image_path)

        # Create the docker container.
        shell_container = client.containers.run(
            image,
            publish_all_ports=True,
            volumes={workspace.root_url: {'bind': '/data', 'mode': 'rw'}},
            working_dir='/data',
            privileged=True,
            detach=True)

        # Store the container's ID.
        workspace.shell_container = shell_container.id
        db_session.flush()

    # Wait for the container to be running.
    # TODO: timeout and error handling
    while shell_container.status != 'running':
        time.sleep(1)
        shell_container = client.containers.get(shell_container.id)

    # Make sure the watch container is up and running, or created it otherwise.
    try:
        watch_container = client.containers.get(workspace.watch_container)
        if watch_container.status in ['paused', 'exited']:
            watch_container.restart()

    except (docker.errors.NullResource, docker.errors.NotFound):
        # Create the docker container.
        watch_container = client.containers.run(
            'saucisson/ws-inotify',
            publish_all_ports=True,
            volumes={workspace.root_url: {'bind': '/data', 'mode': 'rw'}},
            working_dir='/data',
            detach=True)

        # Store the container's ID.
        workspace.watch_container = watch_container.id
        db_session.flush()

    # Wait for the container to be running.
    # TODO: timeout and error handling
    while watch_container.status != 'running':
        time.sleep(1)
        watch_container = client.containers.get(watch_container.id)

    db_session.commit()

    # Retrieve the containers' ports.
    shell_port = shell_container.attrs['NetworkSettings']['Ports']['8080/tcp'][0]['HostPort']
    watch_port = watch_container.attrs['NetworkSettings']['Ports']['8080/tcp'][0]['HostPort']

    # Generate a signed token containing the adresses of the containers URLs,
    # so that resty can redirect client's requests to the correct container.
    signer = JSONWebSignatureSerializer(current_app.config['SECRET_KEY'])
    streams_token = signer.dumps({
        'shell': 'localhost:%s/wetty/socket.io' % shell_port,
        'watch': 'localhost:%s/' % watch_port,
    })

    workspace_data = workspace.to_dict()
    workspace_data['streams_token'] = streams_token.decode('utf-8')
    return jsonify(workspace_data)


@bp.route('/workspaces/<workspace_id>', methods=['DELETE'])
@require_auth
def delete_workspace(auth, workspace_id):
    workspace = fetch_workspace(auth, workspace_id)

    # Delete the local files.
    shutil.rmtree(workspace.root_url)

    # Delete the workspace from database.
    db_session.delete(workspace)
    db_session.commit()

    return '', 204


@bp.route('/workspaces/<workspace_id>/')
@require_auth
def list_files(auth, workspace_id):
    """
    .. http:get:: /workspaces/(workspace_id)/

        Return the list of files in the given workspace.

        :return:
            A list of files.
    """
    workspace = fetch_workspace(auth, workspace_id)
    print(workspace.root_url)

    files = []
    for dirname, _, filenames in os.walk(workspace.root_url):
        for filename in filenames:
            file_path = os.path.join(dirname, filename)

            # Try to identify the mime type of the file.
            mimetype = magic.from_file(file_path, mime=True)
            if mimetype.split('/')[0] == 'text':
                _, extension = os.path.splitext(file_path)
                mimetype = current_app.config['FILE_EXTENSIONS'].get(extension, mimetype)

            files.append({
                'path':     os.path.relpath(os.path.join(dirname, filename), workspace.root_url),
                'mimetype': mimetype,
                'sha':      checksum(file_path),
            })

    return jsonify_list(files)


@bp.route('/workspaces/<workspace_id>/<path:file_path>')
@require_auth
def get_file(auth, workspace_id, file_path):
    """
    .. http:get:: /workspaces/(workspace_id)/(file_path)

        Return the content of the file at the given path.

        :return:
            The content of the file.
    """
    workspace = fetch_workspace(auth, workspace_id)
    file_path = safe_join(workspace.root_url, file_path)
    if not os.path.exists(file_path):
        abort(404)

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] and not request.is_xhr:
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


def fetch_workspace(auth, workspace_id):


    for workspace in auth.workspaces:
        if workspace.name == workspace_id:
            return workspace
        try:
            if workspace.id == int(workspace_id):
                return workspace
        except:
            pass
    abort(404)
