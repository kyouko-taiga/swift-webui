from werkzeug.wsgi import DispatcherMiddleware

from umiushi import factory
from umiushi.apps import api, frontend


app = factory.create_app(__name__)

# Mount the Flask apps using DispatcherMiddleware.
app.wsgi_app = DispatcherMiddleware(
    frontend.create_app(),
    {
        '/api': api.create_app()
    }
)
