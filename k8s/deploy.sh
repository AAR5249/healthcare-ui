#!/bin/bash

# MediBook Kubernetes Deployment Script
# Usage: ./deploy.sh [namespace]

NAMESPACE=${1:-medibook}
NAMESPACE_OPTION="-n $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap and Secrets
kubectl apply $NAMESPACE_OPTION -f configmap.yaml

# Apply all service deployments
kubectl apply $NAMESPACE_OPTION -f auth/deployment.yaml
kubectl apply $NAMESPACE_OPTION -f appointment/deployment.yaml
kubectl apply $NAMESPACE_OPTION -f notification/deployment.yaml
kubectl apply $NAMESPACE_OPTION -f gateway/deployment.yaml

# Wait for deployments to be ready
kubectl rollout status $NAMESPACE_OPTION deployment/gateway
kubectl rollout status $NAMESPACE_OPTION deployment/auth-service
kubectl rollout status $NAMESPACE_OPTION deployment/appointment-service
kubectl rollout status $NAMESPACE_OPTION deployment/notification-service

# Show services
kubectl get services $NAMESPACE_OPTION

echo "Deployment complete!"
echo "Access the application at: http://<LOAD_BALANCER_IP>"
