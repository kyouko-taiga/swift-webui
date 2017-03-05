import os

from flask import Flask

from sqlalchemy import create_engine

from webenvy.core.db import db_session
from webenvy.core.utils.app import register_blueprints


def remove_db_session(exception=None):
    db_session.remove()


def create_app(package_name, package_path=None, debug=False):
    """
    Returns a :class:`Flask` application instance.

    :param package_name:
        The application package name,
    :param package_path:
        The application package path.
    :param debug:
        The debug flag.
    """
    app = Flask(package_name, instance_relative_config=True)

    app.config.from_object('webenvy.settings')
    app.config.from_envvar('WEBENVY_SETTINGS', silent=True)

    if debug:
        app.debug = debug

    app.db_engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    app.teardown_appcontext(remove_db_session)

    if package_path is not None:
        register_blueprints(app, package_name, package_path)
    return app
