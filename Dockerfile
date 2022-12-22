FROM node:14-alpine
RUN mkdir -p /usr/src/app
COPY ./src/* /usr/src/app/
WORKDIR /usr/src/app
RUN apt-get update \
    && apt-get install --no-install-recommends -y procps openssl

ENV NODE_ENV=production
RUN npm install
RUN npm i typescript --save-dev
RUN npm i --save-dev @types/debug
RUN npx tsc

USER node

EXPOSE 80
CMD node /usr/src/app/dist/index.js