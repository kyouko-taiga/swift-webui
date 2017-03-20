FROM swift

RUN apt-get update --yes \
 && apt-get install --yes \
            bash nodejs nodejs-legacy npm git \
 && git clone https://github.com/krishnasrinivas/wetty /wetty \
 && cd /wetty \
 && npm install \
 && rm -f /bin/login \
 && ln -s /bin/bash /bin/login \
 && mkdir -p /data

EXPOSE      8080
WORKDIR     "/data"
ENTRYPOINT  ["nodejs"]
CMD         ["/wetty/app.js", "-p", "8080"]
