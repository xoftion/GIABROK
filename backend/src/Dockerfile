# Use a lightweight Node.js base image
FROM node:18-alpine

# Install curl and bash for Bun installation
RUN apk add --no-cache curl bash

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY backend/package.json ./
RUN bun install --production

# Copy source and config files
COPY backend/src ./src
COPY config.ts ./config.ts

# Expose the port defined by Render's PORT environment variable
EXPOSE ${PORT}

# Start the backend in production mode
CMD ["bun", "run", "start"]
