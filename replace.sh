nohup google-chrome --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --no-sandbox --disable-dev-shm-usage --headless --disable-gpu  >/dev/null 2>&1 &
sed -i "s/SONIC_SERVER_HOST/${SONIC_SERVER_HOST}/g" /usr/share/nginx/html/assets/*.js
sed -i "s/SONIC_SERVER_PORT/${SONIC_SERVER_PORT}/g" /usr/share/nginx/html/assets/*.js
NGINXCONF=/etc/nginx/nginx.conf
if [ "${SONIC_SERVER_HTTPS}" = "true" ]; then
    NGINXCONF=/etc/nginx/nginx-https.conf
    WSORIGINAL="ws:\/\/\${e}:\${t}\/websockets"
    WSREPLACED="wss:\/\/${SONIC_SERVER_HOST}:${SONIC_SERVER_PORT}\/server\/websockets\/hub\/\${e}\/\${t}"
    PROTORIGINAL="\`http:\/\/\`"
    PROTREPLACED="\`https:\/\/\`"
    sed -i "s/$PROTORIGINAL/$PROTREPLACED/g" /usr/share/nginx/html/assets/*.js
    sed -i "s/$WSORIGINAL/$WSREPLACED/g" /usr/share/nginx/html/assets/*.js
fi
/usr/sbin/nginx -c $NGINXCONF -g 'daemon off;'
