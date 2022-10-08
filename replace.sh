nohup google-chrome --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --no-sandbox --disable-dev-shm-usage --headless --disable-gpu  >/dev/null 2>&1 &
sed -i "s/SONIC_SERVER_HOST/${SONIC_SERVER_HOST}/g" /usr/share/nginx/html/assets/*.js
sed -i "s/SONIC_SERVER_PORT/${SONIC_SERVER_PORT}/g" /usr/share/nginx/html/assets/*.js
/usr/sbin/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
