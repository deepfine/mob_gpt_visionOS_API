FROM node:16.15.1

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json file to work directory
# COPY package*.json ./
RUN npm install

# wait-for-it.sh
# COPY wait-for-it.sh ./
# RUN chmod +x wait-for-it.sh

# Docker Demon Port Mapping
EXPOSE 3000