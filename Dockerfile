FROM sonicorg/sonic-client-web-base:v1.0.0

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-https.conf /etc/nginx/nginx-https.conf
COPY dist/  /usr/share/nginx/html/
COPY replace.sh /
RUN chmod 777 /replace.sh
CMD ["/replace.sh"]
