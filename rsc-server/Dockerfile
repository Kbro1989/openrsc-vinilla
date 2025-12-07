# syntax = docker/dockerfile:1
FROM node:18

# Install build dependencies for canvas and other native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package.json ./
COPY rsc-data-local ./rsc-data-local
RUN npm install --production

# Copy source code
COPY . .

# RSC server port
EXPOSE 43594

# Run the Fly.io server entry point
CMD ["node", "src/fly-server.js"]
