import json

from flask import Flask, current_app, jsonify, request


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


class ApiError(Exception):

    def __init__(self, message, http_status=400):
        super(ApiError, self).__init__(message)
        self.http_status = http_status


def jsonify_list(data):
    indent = None
    separators = (',', ':')

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] \
       and not request.is_xhr:
        indent = 2
        separators = (', ', ': ')

    data = json.dumps(data, indent=indent, separators=separators, cls=current_app.json_encoder)
    return current_app.response_class((data, '\n'), mimetype='application/json')


app = Flask(__name__)


@app.route('/')
def index():
    with open('index.html') as f:
        return f.read()


@app.route('/api/repositories/<repository_id>/files/')
def list_files(repository_id):
    return jsonify_list(database['files'])


@app.route('/api/repositories/<repository_id>/files/<path:file_path>', methods=['PATCH'])
def patch_files(repository_id, file_path):
    post_data = request.get_json(force=True)

    for i in range(len(database['files'])):
        if database['files'][i]['path'] == file_path:
            database['files'][i] = post_data
            return jsonify(database['files'][i])

    raise ApiError('file not found', 404)


if __name__ == '__main__':
    app.run(debug=True, port=8000)
