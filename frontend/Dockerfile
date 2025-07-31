# Build stage
FROM node:18-alpine AS builder

# Install Bun
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/package.json ./
RUN bun install --production

# Copy the frontend code
COPY frontend ./

# Build the Next.js app
RUN bun run build

# Production stage
FROM node:18-alpine

# Install Bun
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose the port defined by Render's PORT environment variable
EXPOSE ${PORT}

# Start the Next.js app in production
CMD ["bun", "run", "start"]
