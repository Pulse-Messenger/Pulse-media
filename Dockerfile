FROM node:18-bullseye

RUN apt-get -y update && apt-get -y install build-essential

WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
RUN npm run build

ENV APP_PORT=6060
EXPOSE 6060

CMD [ "node", "dist/index.js" ]
