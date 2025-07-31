# backend/Dockerfile
FROM node:18-alpine

# Install bun
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY src ./src
COPY config.ts* ./

# Expose port (Render expects 10000 by default)
EXPOSE 10000

# Environment variable for production
ENV NODE_ENV=production
ENV PORT=10000

# Start the server
CMD ["bun", "src/index.ts"]
