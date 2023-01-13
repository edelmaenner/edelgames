FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./frontend/package*.json ./
COPY ./frontend/.npmrc ./
COPY ./types /usr/src/types

ARG FONT_AWESOME_AUTH_TOKEN

RUN npm install

# Bundle app source
COPY --chown=node:node ./frontend/ .

# Expose port
EXPOSE 3000

# What the server should do
CMD ["npm", "run", "dev"]
