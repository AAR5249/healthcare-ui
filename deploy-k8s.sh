#!/bin/bash

# MediBook Quick Kubernetes Deploy Script
# This automates the entire deployment process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REGISTRY="${1:-local}"
VERSION="${2:-latest}"
NAMESPACE="medibook"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MediBook - Quick Kubernetes Deployment Script          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker found${NC}"
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}✗ kubectl not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ kubectl found${NC}"
    
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}✗ Kubernetes cluster not accessible${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Kubernetes cluster accessible${NC}"
    echo ""
}

# Build Docker images
build_images() {
    echo -e "${YELLOW}[2/7] Building Docker images...${NC}"
    ./build-docker.sh "$REGISTRY" "$VERSION"
    echo ""
}

# Create namespace
create_namespace() {
    echo -e "${YELLOW}[3/7] Creating Kubernetes namespace...${NC}"
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    echo -e "${GREEN}✓ Namespace created${NC}"
    echo ""
}

# Deploy infrastructure (PostgreSQL, Redis)
deploy_infrastructure() {
    echo -e "${YELLOW}[4/7] Deploying PostgreSQL and Redis...${NC}"
    
    # Create directories for persistent volumes
    sudo mkdir -p /mnt/data/postgres /mnt/data/redis
    sudo chmod 777 /mnt/data/postgres /mnt/data/redis
    
    kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data/postgres"

---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: redis-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data/redis"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: medibook
spec:
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 20Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: medibook
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: medibook
        - name: POSTGRES_PASSWORD
          value: postgres
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
          subPath: postgres
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: medibook
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: medibook
spec:
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 5Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: medibook
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: medibook
spec:
  selector:
    app: redis
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379
  type: ClusterIP
EOF

    echo -e "${GREEN}✓ PostgreSQL and Redis deployed${NC}"
    echo ""
}

# Apply configuration
apply_config() {
    echo -e "${YELLOW}[5/7] Applying configuration...${NC}"
    kubectl apply -f k8s/configmap.yaml -n $NAMESPACE
    echo -e "${GREEN}✓ Configuration applied${NC}"
    echo ""
}

# Deploy services
deploy_services() {
    echo -e "${YELLOW}[6/7] Deploying microservices...${NC}"
    cd k8s
    bash deploy.sh $NAMESPACE
    cd ..
    echo ""
}

# Show status
show_status() {
    echo -e "${YELLOW}[7/7] Deployment status...${NC}"
    echo ""
    echo -e "${BLUE}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    echo ""
    echo -e "${BLUE}Services:${NC}"
    kubectl get svc -n $NAMESPACE
    echo ""
    echo -e "${BLUE}Waiting for rollout...${NC}"
    kubectl rollout status deployment/gateway -n $NAMESPACE
    echo ""
    
    # Get access information
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Deployment Complete! ✓                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Access your application:"
    echo ""
    
    # Check service type
    SERVICE_TYPE=$(kubectl get svc gateway -n $NAMESPACE -o jsonpath='{.spec.type}')
    
    if [ "$SERVICE_TYPE" = "LoadBalancer" ]; then
        EXTERNAL_IP=$(kubectl get svc gateway -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        echo -e "${BLUE}LoadBalancer IP:${NC} http://$EXTERNAL_IP:8000"
    elif [ "$SERVICE_TYPE" = "NodePort" ]; then
        NODE_PORT=$(kubectl get svc gateway -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
        NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
        [ -z "$NODE_IP" ] && NODE_IP=$(hostname -I | awk '{print $1}')
        echo -e "${BLUE}NodePort:${NC} http://$NODE_IP:$NODE_PORT"
    else
        echo -e "${BLUE}Port Forward:${NC} kubectl port-forward svc/gateway 8000:8000 -n $NAMESPACE"
    fi
    echo ""
    echo "Useful commands:"
    echo "  Watch logs:     kubectl logs -f deployment/gateway -n $NAMESPACE"
    echo "  Enter pod:      kubectl exec -it deployment/gateway -n $NAMESPACE -- /bin/sh"
    echo "  View all pods:  kubectl get pods -n $NAMESPACE -o wide"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    
    read -p "Proceed with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
    
    build_images
    create_namespace
    deploy_infrastructure
    apply_config
    deploy_services
    show_status
}

# Run main function
main "$@"
