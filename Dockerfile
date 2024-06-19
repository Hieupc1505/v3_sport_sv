FROM node:current-alpine3.20
WORKDIR /app
COPY ./*.json ./
COPY ./*.js ./
COPY .editorconfig ./
COPY .env ./
COPY ./src ./src
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
