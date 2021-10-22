FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/  /usr/share/nginx/html/
#COPY config.json /usr/share/nginx/html/assets/
COPY replace.sh /