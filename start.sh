#!/bin/bash

echo "Starting backend server..."
cp config.ts backend/config.ts
cd backend && bun run build && bun src/index.ts &

echo "Starting frontend server..."
cd frontend && bun run build && bun run start &

echo "Both servers are running..."
echo "Press Ctrl+C to stop both servers"

wait
