import json

from flask import Flask, current_app, request


def jsonify_list(data):
    indent = None
    separators = (',', ':')

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] \
       and not request.is_xhr:
        indent = 2
        separators = (', ', ': ')

    data = json.dumps(data, indent=indent, separators=separators, cls=current_app.json_encoder)
    return current_app.response_class((data, '\n'), mimetype='application/json')


database = {
    'files': [{
        'mimetype': 'text/x-markdown',
        'path': 'README.md',
        'name': 'README.md',
        'content': 'This is a README file.',
        'repository': '12345'
    },
    {
        'mimetype': 'text/plain',
        'name': 'LICENSE',
        'path': 'LICENSE',
        'content': 'MIT LICENSE',
        'repository': '12345'
    },
    {
        'mimetype': 'text/x-swift',
        'name': 'main.swift',
        'path': 'Sources/main.swift',
        'content': 'print("So swifty!")',
        'repository': '12345'
    }]
}


app = Flask(__name__)


@app.route('/')
def index():
    with open('index.html') as f:
        return f.read()


@app.route('/api/repositories/<repository_id>/files/')
def list_files(repository_id):
    return jsonify_list(database['files'])


if __name__ == '__main__':
    app.run(debug=True, port=8000)
