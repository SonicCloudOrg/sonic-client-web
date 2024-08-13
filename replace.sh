nohup google-chrome --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --no-sandbox --disable-dev-shm-usage --headless --disable-gpu  >/dev/null 2>&1 &
/usr/sbin/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
