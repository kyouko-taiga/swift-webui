#! /bin/bash

cd /
dockerize -wait "${DOCKER_URL}" \
          -wait "${POSTGRES_URL}"
python3 manage.py db sync
supervisord -c /etc/supervisord.conf
