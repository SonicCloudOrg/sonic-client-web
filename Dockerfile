FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/  /usr/share/nginx/html/
COPY replace.sh /
CMD ["/replace.sh"]