import os
import paramiko
import threading
# from eventlet.green import threading

from select import select

from flask import Flask, render_template
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname='localhost', username='4rch0dia', password='NRbpEhde8')

channel = ssh.invoke_shell('xterm')
channel.setblocking(False)
channel.settimeout(10.0)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('stdin')
def handle_connect(payload):
    emit('stdout', { 'data': payload.get('data', '') })
    socketio.sleep(0)
    channel.send(payload.get('data', ''))


def forward_outbound(channel):
    while True:
        select([channel], [], [])
        data = channel.recv(1024)
        if not data:
            break
        print(data)
        socketio.emit('stdout', { 'data': data.decode() })
        socketio.sleep(0)


thread = threading.Thread(target=forward_outbound, args=[channel])
thread.start()


if __name__ == '__main__':
    socketio.run(app, port=8081)
    channel.close()
    ssh.close()
