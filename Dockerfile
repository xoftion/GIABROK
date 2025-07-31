# 1️⃣ Build frontend with Node.js
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/ .
RUN npm install
RUN npm run build

# 2️⃣ Bundle runtime image with Bun for backend
FROM oven/bun:1.0
WORKDIR /app

# Copy frontend build artifacts
COPY --from=frontend /app/frontend/.next ./frontend/.next
COPY --from=frontend /app/frontend/public ./frontend/public
COPY --from=frontend /app/frontend/package.json ./frontend/package.json
COPY --from=frontend /app/frontend/node_modules ./frontend/node_modules

# Copy full backend
COPY backend ./backend

# Install backend deps using Bun
RUN cd backend && bun install

EXPOSE 4000
CMD ["bun", "backend/src/index.ts"]
