#!/bin/bash

echo "Starting backend server..."
cp config.ts backend/config.ts
cd backend && bun run start &

echo "Starting frontend server..."
cd frontend && bun run start &

echo "Both servers are starting..."
echo "Press Ctrl+C to stop both servers"
wait
