import argparse

from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from umiushi import factory
from umiushi.apps import api, frontend
from umiushi.core.socketio import socketio


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        # Initialize the command parser and create the subcommands.
        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the web server.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        sub = subparsers.add_parser('run', help='Run the server.')
        sub.add_argument(
            '-p', '--port', dest='port', action='store', type=int, default=8080,
            help='Specify the listening port (default: 8080).')
        sub.add_argument(
            '-o', '--host', dest='host', action='store', default='localhost',
            help='Specify the hostname to listen on (default: localhost).')
        sub.add_argument(
            '-d', '--debug', dest='debug', action='store_true', default=False,
            help='Start the server in debug mode.')

        # Parse and execute the command line.
        print("before parse")
        args = parser.parse_args(self.argv[1:])

        if args.subcommand == 'run':
            print("ici")
            app = factory.create_app(__name__)
            print("la")
            # Mount the Flask apps using DispatcherMiddleware.
            app.wsgi_app = DispatcherMiddleware(
                frontend.create_app(debug=args.debug),
                {
                    '/api': api.create_app(debug=args.debug)
                }
            )
            print("here", args.host, args.port)
            # Run the server.
            socketio.init_app(app)
            socketio.run(app, host=args.host, port=args.port, debug=args.debug)
