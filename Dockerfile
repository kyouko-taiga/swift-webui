FROM alpine:edge

ARG RESTY_VERSION="1.11.2.1"
ARG RESTY_OPENSSL_VERSION="1.0.2j"
ARG RESTY_PCRE_VERSION="8.39"
ARG RESTY_J="1"
ARG RESTY_CONFIG_OPTIONS="\
    --with-ipv6 \
    --with-pcre-jit \
    --with-threads \
    --with-openssl=/tmp/openssl-${RESTY_OPENSSL_VERSION} \
    --with-pcre=/tmp/pcre-${RESTY_PCRE_VERSION} \
    --with-luajit=/usr \
    "

ADD . /src/webui

RUN apk add --no-cache --virtual .build-deps \
        build-base \
        cmake \
        make \
        openssl-dev \
        perl-dev \
        readline-dev \
        zlib-dev \
        py2-pip \
        nodejs \
 && apk add --no-cache \
        bash \
        curl \
        git \
        libgcc \
        libstdc++ \
        ncurses \
        openssh-keygen \
        openssh-client \
        openssl \
        perl \
        readline \
        unzip \
        zip \
        zlib \
 && pip install hererocks \
 && hererocks --luajit=2.1 --luarocks=^ /usr \
 && luarocks install luasec \
 && cd /tmp \
 && curl -fSL https://www.openssl.org/source/openssl-${RESTY_OPENSSL_VERSION}.tar.gz -o openssl-${RESTY_OPENSSL_VERSION}.tar.gz \
 && tar xzf openssl-${RESTY_OPENSSL_VERSION}.tar.gz \
 && curl -fSL https://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-${RESTY_PCRE_VERSION}.tar.gz -o pcre-${RESTY_PCRE_VERSION}.tar.gz \
 && tar xzf pcre-${RESTY_PCRE_VERSION}.tar.gz \
 && curl -fSL https://openresty.org/download/openresty-${RESTY_VERSION}.tar.gz -o openresty-${RESTY_VERSION}.tar.gz \
 && tar xzf openresty-${RESTY_VERSION}.tar.gz \
 && cd /tmp/openresty-${RESTY_VERSION} \
 && ./configure -j${RESTY_J} ${RESTY_CONFIG_OPTIONS} \
 && make -j${RESTY_J} \
 && make -j${RESTY_J} install \
 && cd /tmp \
 && rm -rf \
       openssl-${RESTY_OPENSSL_VERSION} \
       openssl-${RESTY_OPENSSL_VERSION}.tar.gz \
       openresty-${RESTY_VERSION}.tar.gz openresty-${RESTY_VERSION} \
       pcre-${RESTY_PCRE_VERSION}.tar.gz pcre-${RESTY_PCRE_VERSION} \
 && ln -sf /dev/stdout /usr/local/openresty/nginx/logs/access.log \
 && ln -sf /dev/stderr /usr/local/openresty/nginx/logs/error.log \
 && cd /src/webui/ \
 && mkdir -p static/build \
 && npm install \
 && npm run build \
 && npm rebuild node-sass \
 && npm run css \
 && mkdir -p /www \
 && cp lapis/*        / \
 && cp -r views       /views \
 && cp -r static      /www/static \
 && luarocks install  rockspec/netstring-1.0.3-0.rockspec \
 && luarocks install  rockspec/lua-resty-qless-develop-0.rockspec \
 && luarocks install  rockspec/lua-websockets-develop-0.rockspec \
 && luarocks make     rockspec/webui-master-1.rockspec \
 && rm -rf            /src/webui \
 && apk del           .build-deps

ENV PATH /usr/local/openresty/bin/:$PATH
