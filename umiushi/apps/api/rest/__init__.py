# We need to import the blueprints objects from the modules here, so that they
# get registered by register_blueprints at the app creation.

from .repositories import bp as repositories_blueprint
