FROM nginx:1.20.0

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install \
    wget \
    gnupg

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install google-chrome-stable \
  && rm /etc/apt/sources.list.d/google-chrome.list \
   && rm -rf /var/lib/apt/lists/* \
  && apt-get clean

RUN google-chrome --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --no-sandbox --disable-dev-shm-usage --headless --disable-gpu

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/  /usr/share/nginx/html/
COPY replace.sh /
RUN chmod 777 /replace.sh
CMD ["/replace.sh"]
