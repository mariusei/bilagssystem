FROM node:16-bullseye
EXPOSE 8000

RUN npm config set unsafe-perm true
RUN npm install -g gatsby-cli
WORKDIR /app
COPY ./package.json /app
RUN npm cache clean --force
RUN npm install --arch=x64 --platform=linux --legacy-peer-deps
COPY . /app

RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache
CMD ["gatsby", "develop", "-H", "0.0.0.0" ]
