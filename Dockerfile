FROM ubuntu:22.04

# Install dependencies
RUN apt update && apt install -y sudo curl wget git nano iputils-ping net-tools

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Create /app but DO NOT set WORKDIR globally
RUN mkdir -p /app

# Install only needed Node modules
RUN cd /app && npm init -y && npm install express http-proxy-middleware

# Install ttyd
RUN wget https://github.com/tsl0922/ttyd/releases/download/1.7.4/ttyd.x86_64 \
    -O /usr/bin/ttyd && chmod +x /usr/bin/ttyd

# Copy files
COPY server.js /app/server.js
COPY index.html /app/index.html

EXPOSE 10000

CMD bash -lc " \
    echo 'Starting ttyd on internal port 7681...'; \
    cd / && nohup ttyd --writable --port 7681 bash > /dev/null 2>&1 & \
    echo 'Starting reverse proxy on PORT='$PORT; \
    node /app/server.js \
"
