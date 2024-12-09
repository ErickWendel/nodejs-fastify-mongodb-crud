FROM node:20.11-alpine3.18 as build

WORKDIR /src/

COPY package.json package-lock.json /src/

COPY . /src/

RUN  npm ci --silent

USER node

CMD npm run start
