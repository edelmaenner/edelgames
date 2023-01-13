FROM node:18-alpine as build-stage

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY .npmrc ./

ARG FONT_AWESOME_AUTH_TOKEN

RUN npm install

# Bundle app source
COPY --chown=node:node . .

# Build optimized production files
RUN npm run build

# --- Build-Stage finished ---

FROM nginx:1.18-alpine

COPY --from=build-stage /usr/src/app/build/ /usr/share/nginx/html
COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000