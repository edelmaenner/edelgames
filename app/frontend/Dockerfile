FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./frontend/package*.json ./
COPY ./frontend/.npmrc ./
COPY ./types /usr/src/types

ARG FONT_AWESOME_AUTH_TOKEN
ARG API_HTTP_PORT
ARG API_APP_DOMAIN
ARG REACT_HTTP_PORT
ARG REACT_APP_DOMAIN
ENV API_HTTP_PORT=$API_HTTP_PORT
ENV API_APP_DOMAIN=$API_APP_DOMAIN
ENV REACT_HTTP_PORT=$REACT_HTTP_PORT
ENV REACT_APP_DOMAIN=$REACT_APP_DOMAIN

RUN npm install

# Bundle app source
COPY --chown=node:node ./frontend/ .

# Expose port
EXPOSE 3000

# What the server should do
CMD ["npm", "run", "dev"]
