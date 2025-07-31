# --- Stage 1: Build frontend with Node ---
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy only frontend directory
COPY frontend ./frontend

# Install and build the frontend
WORKDIR /app/frontend
RUN npm install && npm run build


# --- Stage 2: Run backend with Bun ---
FROM oven/bun:1.1.13

WORKDIR /app

# Copy backend and root config
COPY backend ./backend
COPY config.ts ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json

# Install backend dependencies
WORKDIR /app/backend
RUN bun install

# Expose backend port
EXPOSE 4000

# Start backend server
CMD ["bun", "src/index.ts"]
