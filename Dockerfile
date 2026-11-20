# Lottery em container (servidor Locaweb). Usa o Chromium do Debian em vez do Chrome baixado pelo Puppeteer.
FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DB_DIR=/data

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y chromium fonts-liberation python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force && \
    apt-get purge -y python3 make g++ && apt-get autoremove -y

COPY . .
RUN mkdir -p /data && chown -R node:node /data /app/public
USER node
EXPOSE 3000
CMD ["node", "index.js"]
