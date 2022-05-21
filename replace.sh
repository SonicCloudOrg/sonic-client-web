sed -i "s/SERVER_HOST/${SERVER_HOST}/g" /usr/share/nginx/html/assets/*.js
sed -i "s/SONIC_GATEWAY_PORT/${SONIC_GATEWAY_PORT}/g" /usr/share/nginx/html/assets/*.js
/usr/sbin/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'