import argparse

from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from umiushi import factory
from umiushi.apps import api, frontend

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
        args = parser.parse_args(self.argv[1:])

        if args.subcommand == 'run':
            app = DispatcherMiddleware(
                frontend.create_app(debug=args.debug), {
                    '/api': api.create_app(debug=args.debug)
                }
            )

            # Run a simple HTTP server with the wsgi application.
            run_simple(args.host, args.port, app, use_reloader=True, use_debugger=True)
