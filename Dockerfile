FROM alpine:edge

ADD . /src

RUN apk add --no-cache --virtual .build-deps \
        build-base \
        make \
        nodejs \
        libffi-dev \
        postgresql-dev \
        python3-dev \
 && apk add --no-cache \
        bash \
        libffi \
        libmagic \
        openssl \
        postgresql-client \
        python3 \
 && apk add --no-cache \
            --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
        dockerize \
 && cd /src \
 && pip3 install -r requirements.txt \
 && mkdir -p static/build \
 && npm install \
 && npm run build \
 && npm rebuild node-sass \
 && npm run css \
 && mkdir -p /www \
 && cp -r static /www/static \
 && rm -rf /src/node_modules \
 && apk del .build-deps

EXPOSE      8080
WORKDIR     /src
ENTRYPOINT  /src/bin/umiushi
