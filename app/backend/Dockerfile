FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./backend/package*.json ./backend/
COPY ./backend/tsconfig.json ./backend/
COPY ./backend/.npmrc ./backend/
COPY ./types /usr/src/app/types

ARG FONT_AWESOME_AUTH_TOKEN

WORKDIR /usr/src/app/types
RUN npm install
WORKDIR /usr/src/app/backend
RUN npm install

# Bundle app source
COPY --chown=node:node ./ .

# What the server should do
CMD [ "npm", "run", "start" ]