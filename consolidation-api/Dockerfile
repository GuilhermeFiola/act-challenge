FROM node:20-alpine as builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY swagger.json ./

RUN npm ci

COPY . .

# Testing and building  project
RUN npm run create

FROM node:20-alpine

# Install Dockerize
RUN apk add --no-cache wget && \
    wget -q https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY swagger.json ./
COPY .env ./

RUN npm ci --production

COPY --from=builder /usr/src/app/dist/src ./dist

EXPOSE 7001
# I'm using Dockerize to wait for RabbitMQ before starting the app
CMD ["dockerize", "-wait", "tcp://rabbitmq:5672", "-timeout", "30s", "node", "dist/index.js"]