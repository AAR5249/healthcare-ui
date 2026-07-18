#!/bin/bash

# Quick start script - runs all services in background

echo "Starting all MediBook services..."

# Start Redis container if not running
docker run -d --name medibook-redis -p 6379:6379 redis:7-alpine 2>/dev/null || true

# Function to start a service
start_service() {
    local service=$1
    local port=$2
    echo "Starting $service on port $port..."
    cd $service && npm run dev &
    cd ..
}

# Start all services
cd /tmp/cc-agent/67795058/project

start_service "auth-service" 8001
sleep 2
start_service "appointment-service" 8002
start_service "notification-service" 8003
sleep 2
start_service "gateway" 8000

echo ""
echo "All services started!"
echo "API Gateway: http://localhost:8000"
echo "Swagger UI: http://localhost:8000/api-docs"
echo ""
echo "Press Ctrl+C to stop all services"
wait
