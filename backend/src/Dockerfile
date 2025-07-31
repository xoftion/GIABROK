# Use Bun official image
FROM oven/bun:1.1.13

# Set working directory
WORKDIR /app

# Copy only backend files
COPY ./backend /app

# Install dependencies
RUN bun install --production --no-frozen-lockfile

# Expose backend port
EXPOSE 4000

# Run the backend server in production
CMD ["bun", "run", "src/index.ts"]
