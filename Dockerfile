# ---------- Stage 1: Build frontend ----------
FROM oven/bun:1.1.13 AS frontend

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lockb ./
RUN bun install

COPY frontend ./
RUN bun run build


# ---------- Stage 2: Full App with backend ----------
FROM oven/bun:1.1.13

# Add compiler tools to support native modules like cpu-features
RUN apt update && apt install -y build-essential

# Set working directory
WORKDIR /app

# Copy shared files (config.ts in root)
COPY config.ts ./

# Copy built frontend output into /app/frontend
COPY --from=frontend /app/frontend/.next ./frontend/.next
COPY --from=frontend /app/frontend/public ./frontend/public
COPY --from=frontend /app/frontend/package.json ./frontend/package.json

# Copy backend source
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN bun install

# Expose backend API port for Render
EXPOSE 4000

# Start the Bun backend
CMD ["bun", "src/index.ts"]
