#!/bin/bash

# MediBook Docker Build Script
# This script builds all Docker images for the healthcare-ui project

set -e  # Exit on error

# Configuration
REGISTRY="${1:-local}"
VERSION="${2:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== MediBook Docker Build Script ===${NC}"
echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo ""

# Build Gateway
echo -e "${YELLOW}Building Gateway...${NC}"
docker build -t "$REGISTRY/medibook-gateway:$VERSION" -f ./gateway/Dockerfile .
echo -e "${GREEN}✓ Gateway built successfully${NC}\n"

# Build Auth Service
echo -e "${YELLOW}Building Auth Service...${NC}"
docker build -t "$REGISTRY/medibook-auth:$VERSION" -f ./auth-service/Dockerfile .
echo -e "${GREEN}✓ Auth Service built successfully${NC}\n"

# Build Appointment Service
echo -e "${YELLOW}Building Appointment Service...${NC}"
docker build -t "$REGISTRY/medibook-appointment:$VERSION" -f ./appointment-service/Dockerfile .
echo -e "${GREEN}✓ Appointment Service built successfully${NC}\n"

# Build Notification Service
echo -e "${YELLOW}Building Notification Service...${NC}"
docker build -t "$REGISTRY/medibook-notification:$VERSION" -f ./notification-service/Dockerfile .
echo -e "${GREEN}✓ Notification Service built successfully${NC}\n"

# Build Frontend
echo -e "${YELLOW}Building Frontend...${NC}"
docker build -t "$REGISTRY/medibook-frontend:$VERSION" -f ./frontend/Dockerfile -C frontend .
echo -e "${GREEN}✓ Frontend built successfully${NC}\n"

echo -e "${GREEN}=== All images built successfully! ===${NC}"
echo ""
echo "Built images:"
echo "  - $REGISTRY/medibook-gateway:$VERSION"
echo "  - $REGISTRY/medibook-auth:$VERSION"
echo "  - $REGISTRY/medibook-appointment:$VERSION"
echo "  - $REGISTRY/medibook-notification:$VERSION"
echo "  - $REGISTRY/medibook-frontend:$VERSION"
