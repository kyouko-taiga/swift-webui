from flask import current_app, request
from flask_socketio import emit, join_room, leave_room, rooms

from webenvy.core.socketio import socketio


@socketio.on('connect', namespace='/ssh')
def handle_connect():
    pass
