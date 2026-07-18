#!/bin/bash

# MediBook Setup Script
# Run this script to set up the project for local development

set -e

echo "=== MediBook Healthcare System Setup ==="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Install shared packages first
echo ""
echo "Installing shared packages..."
cd shared/packages/types && npm install && npm run build
cd ../../../shared/packages/utils && npm install && npm run build
cd ../../../shared/packages/middleware && npm install && npm run build
cd ../../..

# Install dependencies for each service
echo ""
echo "Installing Auth Service dependencies..."
cd auth-service && npm install && cd ..

echo "Installing Appointment Service dependencies..."
cd appointment-service && npm install && cd ..

echo "Installing Notification Service dependencies..."
cd notification-service && npm install && cd ..

echo "Installing Gateway dependencies..."
cd gateway && npm install && cd ..

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "To run the services locally:"
echo "  1. Open 5 terminals"
echo "  2. In each terminal, run one of these commands:"
echo ""
echo "     Terminal 1: cd auth-service && npm run dev"
echo "     Terminal 2: cd appointment-service && npm run dev"
echo "     Terminal 3: cd notification-service && npm run dev"
echo "     Terminal 4: cd gateway && npm run dev"
echo ""
echo "Or run all services with Docker:"
echo "     docker-compose up"
echo ""
echo "Access points:"
echo "  - API Gateway: http://localhost:8000"
echo "  - Swagger UI: http://localhost:8000/api-docs"
echo "  - Health checks: http://localhost:8000/health"
