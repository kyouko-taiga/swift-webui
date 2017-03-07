FROM python:3.5

# Install python dependencies
COPY ./requirements.txt /requirements.txt
RUN \
   pip install uwsgi && \
   pip install -r requirements.txt

# Install npm.
RUN \
   apt-get update && \
   apt-get install -y nodejs && \
   rm -rf /var/lib/apt/lists/*

# Install Nginx
RUN \
   apt-get update && \
   apt-get install -y nginx && \
   rm -rf /var/lib/apt/lists/*

# Forward request and error logs to docker log collector
RUN \
   ln -sf /dev/stdout /var/log/nginx/access.log && \
   ln -sf /dev/stderr /var/log/nginx/error.log

# Make Nginx run on the foreground
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Override the default configuration for Nginx
RUN   rm /etc/nginx/sites-available/default
COPY  conf/default /etc/nginx/sites-available/default
# RUN   ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled

# Copy the base uWSGI ini file to enable default dynamic uwsgi process number
COPY conf/uwsgi.ini /etc/uwsgi/

# Expose Nginx ports
EXPOSE 80 443

# Install Supervisord
RUN \
   apt-get update && \
   apt-get install -y supervisor && \
   rm -rf /var/lib/apt/lists/*

# Custom Supervisord config
COPY conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY ./umiushi       /umiushi
COPY ./main.py       /main.py
COPY ./manage.py     /manage.py
COPY ./.settings.py  /umiushi/settings.py
WORKDIR /

# Build umiushi.
RUN \
   python manage.py db sync && \
   mkdir -p static/build
#   npm install && \
#   npm run build && \
#   npm run css

CMD ["/usr/bin/supervisord"]
