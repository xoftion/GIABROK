#!/bin/bash

echo "Starting backend server..."
cd /app/backend
bun src/index.ts &

echo "Starting frontend server..."
cd /app/frontend
bun run start &

echo "Both servers are started..."
echo "Press Ctrl+C to stop both servers"

wait
