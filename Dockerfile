# Start from Bun base image
FROM oven/bun:1.0

# Set working directory
WORKDIR /app

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y build-essential

# Copy everything
COPY . .

# Install frontend deps and build it
RUN cd frontend && bun install && bun run build

# Install backend deps (requires build tools)
RUN cd backend && bun install

# Expose the backend port
EXPOSE 4000

# Run the backend server
CMD ["bun", "backend/src/index.ts"]
