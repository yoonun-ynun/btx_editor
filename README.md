# Usage
### Build
    sudo docker build . -t btx_editor:latest

### RUN(example for using let's encrypt on linux)
    sudo docker run -d \
    -p 443:443 \
    -e DOMAIN={YOUR DOMAIN} \
    --name BTX \
    -v /etc/letsencrypt:/sslkey \
    btx_editor:1.0