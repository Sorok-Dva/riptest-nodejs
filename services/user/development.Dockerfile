FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./package*.json ./
COPY ./tsconfig.json ./
RUN npm install

EXPOSE 80
CMD ["npm", "run", "start-build-watch"]
