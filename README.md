# Usage
### Build
    sudo docker build . -t btx_editor:latest

### RUN
    sudo docker run -d \
    -p 443:443 \
    -e DOMAIN=mc.yoonun.page \
    --name BTX \
    -v /etc/letsencrypt:/sslkey \
    btx_editor:1.0