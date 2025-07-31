# Base image with Bun
FROM oven/bun:1.1.13 as base

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# ========================
# 🔧 Build Frontend
# ========================
WORKDIR /app/frontend
RUN bun install && bun run build

# ========================
# 🚀 Start Backend
# ========================
WORKDIR /app/backend
RUN bun install

# Expose port Render will use
EXPOSE 4000

# Start the backend server
CMD ["bun", "src/index.ts"]
