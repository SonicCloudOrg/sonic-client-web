sed -i "s/SERVER_HOST/${SERVER_HOST}/g" /usr/share/nginx/html/assets/*.js
sed -i "s/SERVER_PORT/${SERVER_PORT}/g" /usr/share/nginx/html/assets/*.js
/usr/sbin/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'