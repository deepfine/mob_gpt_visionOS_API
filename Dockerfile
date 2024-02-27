FROM node:16.15.1

# Set the timezone in docker
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone

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