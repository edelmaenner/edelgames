FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./frontend/package*.json ./frontend/
COPY ./frontend/tsconfig.json ./frontend/
COPY ./frontend/config-overrides.js ./frontend/
COPY ./frontend/.env ./frontend/
COPY ./frontend/.npmrc ./frontend/
COPY ./types /usr/src/app/types

ARG FONT_AWESOME_AUTH_TOKEN

WORKDIR /usr/src/app/types
RUN npm install
WORKDIR /usr/src/app/frontend
RUN npm install

# Bundle app source
COPY --chown=node:node ./frontend/src ./src/
COPY --chown=node:node ./frontend/public ./public/

# Build optimized production files
RUN npm run build

# --- Build-Stage finished ---
RUN npm install -g serve

# What the server should do
CMD [ "npm", "run", "serve" ]
