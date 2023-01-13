FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY .npmrc ./
RUN npm install

# Bundle app source
COPY --chown=node:node . .

# Expose port
EXPOSE 5000

# What the server should do
CMD [ "npm", "run start" ]