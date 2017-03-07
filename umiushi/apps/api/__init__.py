from flask import jsonify

from umiushi import factory


def create_app(debug=False):
    app = factory.create_app(__name__, __path__, debug)

    @app.route('/')
    def version():
        return jsonify({'version': '1.0'})

    return app
