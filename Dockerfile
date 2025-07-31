# ─── Stage 1: Build Frontend with Node.js ───
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Final Image with Bun backend ───
FROM oven/bun:1.0
WORKDIR /app

# Copy built frontend app
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Copy backend
COPY backend ./backend

# Install build essentials, if needed
RUN apt-get update && apt-get install -y build-essential \
  && cd backend && bun install

EXPOSE 4000
CMD ["bun", "backend/src/index.ts"]
