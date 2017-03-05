from webenvy import factory


def create_app(debug=False):
    app = factory.create_app(__name__, __path__, debug)
    return app
