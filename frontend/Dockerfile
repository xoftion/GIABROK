# Use Bun official image
FROM oven/bun:1.0

WORKDIR /app

# Copy everything into the container
COPY . .

# Install frontend dependencies, then build the Next.js app
RUN cd frontend && bun install && bun run build

# Install backend dependencies
RUN cd backend && bun install

# Expose port 4000 for Render
EXPOSE 4000

# Start the Bun backend server
CMD ["bun", "backend/src/index.ts"]
