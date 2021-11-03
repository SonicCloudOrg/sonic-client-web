sed -i "s/SONIC_API_HOST/${SONIC_API_HOST}/g" /usr/share/nginx/html/assets/*.js
sed -i "s/SONIC_API_PORT/${SONIC_API_PORT}/g" /usr/share/nginx/html/assets/*.js
/usr/sbin/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'