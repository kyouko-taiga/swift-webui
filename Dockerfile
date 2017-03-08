FROM alpine:edge

ADD . /src

ENV PATH /usr/bin/:$PATH
ENV PATH /usr/local/openresty/bin/:$PATH
ARG RESTY_VERSION="1.11.2.1"

RUN apk add --no-cache --virtual .build-deps \
        build-base \
        cmake \
        libffi-dev \
        linux-headers \
        make \
        musl-dev \
        nodejs \
        nodejs-npm \
        pcre-dev \
        postgresql-dev \
        python3-dev \
        readline-dev \
        zlib-dev \
 && apk add --no-cache \
        bash \
        curl \
        git \
        libffi \
        libmagic \
        libstdc++ \
        openssl \
        pcre \
        perl \
        postgresql-client \
        python3 \
        readline \
        supervisor \
        uwsgi \
        uwsgi-python3 \
        unzip \
        zlib \
 && apk add --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
        dockerize \
 && addgroup -g 82 -S www-data \
 && adduser -u 82 -D -S -G www-data www-data \
 && pip3 install hererocks \
 && hererocks --luajit=2.1 --luarocks=^ --compat=5.2 /usr \
 && luarocks install luasec \
 && cd /tmp \
 && curl -fSL https://openresty.org/download/openresty-${RESTY_VERSION}.tar.gz -o openresty-${RESTY_VERSION}.tar.gz \
 && tar xzf openresty-${RESTY_VERSION}.tar.gz \
 && cd /tmp/openresty-${RESTY_VERSION} \
 && ./configure --with-ipv6 \
                --with-pcre-jit \
                --with-threads \
                --with-luajit=/usr \
 && make \
 && make install \
 && rm -rf openresty-${RESTY_VERSION}.tar.gz openresty-${RESTY_VERSION} \
 && ln -sf /dev/stdout /usr/local/openresty/nginx/logs/access.log \
 && ln -sf /dev/stderr /usr/local/openresty/nginx/logs/error.log \
 && cd /src \
 && pip3 install -r requirements.txt \
 && mkdir -p static/build \
 && npm install \
 && npm run build \
 && npm rebuild node-sass \
 && npm run css \
 && mkdir -p /www \
 && cp -r /src/static /www/static \
 && rm -rf /src/node_modules \
 && cp -r /src/umiushi   /umiushi \
 && cp /src/umiushi.sh   /umiushi.sh \
 && cp /src/main.py      /main.py \
 && cp /src/manage.py    /manage.py \
 && mkdir -p /etc/nginx /etc/uwsgi \
 && cp /src/conf/nginx.conf       /etc/nginx/nginx.conf \
 && cp /src/conf/supervisord.conf /etc/supervisord.conf \
 && cp /src/conf/uwsgi.ini        /etc/uwsgi/uwsgi.ini \
 && cd / \
 && rm -rf /src \
 && chown -R www-data:www-data /www \
 && chown -R www-data:www-data /umiushi \
 && apk del .build-deps \
 && true

EXPOSE 80 443
WORKDIR /
ENTRYPOINT ["supervisord"]
CMD ["-c", "/etc/supervisord.conf"]
