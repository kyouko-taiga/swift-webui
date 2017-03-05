import os


basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Application files
DATA_ROOT = os.path.join(basedir, 'data')

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'webenvy.sqlite')

# Cryptographically signed messages
SECRET_KEY = 'secret'
AUTH_TOKEN_DURATION = 86400

# Github
APPLICATION_NAME = 'webenvy'
APPLICATION_ID = 'APPLICATION_ID'
APPLICATION_SECRET = 'APPLICATION_SECRET'

# Mimetypes
FILE_EXTENSIONS = {
    '.swift': 'text/x-swift',
    '.md':    'text/x-markdown',
}
