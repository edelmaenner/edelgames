FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./backend/package*.json ./
COPY ./backend/.npmrc ./
COPY ./types /usr/src/types

ARG FONT_AWESOME_AUTH_TOKEN
ARG API_HTTP_PORT
ARG API_APP_DOMAIN
ARG REACT_HTTP_PORT
ARG REACT_APP_DOMAIN

RUN npm install

# Bundle app source
COPY --chown=node:node ./backend/ .

# Expose port
EXPOSE 5000

# What the server should do
CMD [ "npm", "run", "start" ]