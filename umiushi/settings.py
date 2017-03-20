import os

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Application files
DATA_ROOT_URL = os.path.join(basedir, 'data')

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = os.environ.get('POSTGRES_URL').replace('tcp://', 'postgresql://')

# Cryptographically signed messages
SECRET_KEY = 'secret'
AUTH_TOKEN_DURATION = 86400

# Github
APPLICATION_NAME = 'umiushi'
GITHUB_CLIENT_ID = os.environ.get('APPLICATION_ID')
GITHUB_CLIENT_SECRET = os.environ.get('APPLICATION_SECRET')

# Docker
DOCKER_IMAGES_ROOT_DIR = os.path.join(basedir, 'umiushi', 'docker_images')
DOCKER_IMAGES = {
    'swift': os.path.join(DOCKER_IMAGES_ROOT_DIR, 'swift'),
}

# Mimetypes
FILE_EXTENSIONS = {
    '.swift': 'text/x-swift',
    '.md':    'text/x-markdown',
}
