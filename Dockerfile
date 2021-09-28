FROM node:14-alpine

ENV APP_HOME /usr/src/app

WORKDIR /$APP_HOME

COPY package.json $APP_HOME/

RUN npm install

COPY . $APP_HOME/

RUN npm run build

CMD [ "npm", "start" ]
