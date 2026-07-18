# Kubernetes Deployment Guide for MediBook on VPS

## Prerequisites Checklist

- [ ] VPS is running Ubuntu 24.04.4 LTS (confirmed ✓)
- [ ] Docker is installed
- [ ] kubectl is installed and configured
- [ ] Kubernetes cluster is running (kubeadm, minikube, or managed)
- [ ] Docker registry access (Docker Hub or private registry)

## Step 1: Install Required Tools

### 1.1 Install Docker
```bash
# Update package manager
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
```

### 1.2 Install kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

### 1.3 Install Kubernetes Cluster

**Option A: Using kubeadm (Production)**
```bash
# Follow official guide
curl https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/setup/kubeadm.sh | bash
```

**Option B: Using minikube (Testing)**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
```

## Step 2: Build Docker Images

### 2.1 Clone Repository on VPS
```bash
cd ~
git clone https://github.com/AAR5249/healthcare-ui.git
cd healthcare-ui
```

### 2.2 Build Images Locally (Option A: Local Registry)
```bash
# Make script executable
chmod +x build-docker.sh

# Build with local registry tag
./build-docker.sh local latest

# Verify images built
docker images | grep medibook
```

### 2.3 Push to Docker Registry (Option B: Docker Hub)

**Create Docker Hub Account & Push:**
```bash
# Login to Docker Hub
docker login

# Build with your username
./build-docker.sh your-username latest

# Push images
docker push your-username/medibook-gateway:latest
docker push your-username/medibook-auth:latest
docker push your-username/medibook-appointment:latest
docker push your-username/medibook-notification:latest
docker push your-username/medibook-frontend:latest
```

**For Private Registry:**
```bash
# If using private registry (e.g., 192.168.1.100:5000)
./build-docker.sh 192.168.1.100:5000 latest
docker push 192.168.1.100:5000/medibook-gateway:latest
# ... push all images
```

## Step 3: Update Kubernetes Configuration

### 3.1 Update Image References
Edit `k8s/deployment` files to match your registry:

**For local registry (file://):**
```bash
# Update all deployments to use: medibook-gateway:latest
sed -i 's|image: medibook/|image: |g' k8s/**/*.yaml
sed -i 's|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' k8s/**/*.yaml
```

**For Docker Hub:**
```bash
sed -i 's|image: medibook/|image: your-username/medibook-|g' k8s/**/*.yaml
```

### 3.2 Update Secrets
Edit `k8s/configmap.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: medibook-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://postgres:your-password@postgres:5432/medibook"
  JWT_SECRET: "your-production-jwt-secret-key-min-32-chars"
  REDIS_URL: "redis://redis:6379"
  SMTP_HOST: "smtp.gmail.com"  # or your email provider
  SMTP_USER: "your-email@example.com"
  SMTP_PASS: "your-app-password"
```

## Step 4: Deploy Database & Redis

### 4.1 Create Persistent Volumes
```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: medibook

---
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
EOF
```

### 4.2 Deploy PostgreSQL
```bash
kubectl apply -f - <<'EOF'
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
          valueFrom:
            secretKeyRef:
              name: medibook-secrets
              key: DB_PASSWORD
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
EOF
```

### 4.3 Deploy Redis
```bash
kubectl apply -f - <<'EOF'
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
```

## Step 5: Deploy Application

### 5.1 Apply ConfigMap & Secrets
```bash
kubectl apply -f k8s/configmap.yaml -n medibook
```

### 5.2 Deploy Services
```bash
cd k8s
bash deploy.sh medibook
```

Or manually:
```bash
kubectl apply -f k8s/auth/deployment.yaml -n medibook
kubectl apply -f k8s/appointment/deployment.yaml -n medibook
kubectl apply -f k8s/notification/deployment.yaml -n medibook
kubectl apply -f k8s/gateway/deployment.yaml -n medibook
```

### 5.3 Wait for Deployments
```bash
kubectl rollout status deployment/gateway -n medibook
kubectl rollout status deployment/auth-service -n medibook
kubectl rollout status deployment/appointment-service -n medibook
kubectl rollout status deployment/notification-service -n medibook
```

## Step 6: Run Database Migrations

```bash
# Forward postgres port
kubectl port-forward svc/postgres 5432:5432 -n medibook &

# Run migrations
psql -h localhost -U postgres -d medibook < supabase/migrations/*.sql

# Kill port-forward
kill %1
```

## Step 7: Expose Application

### Option A: NodePort
```bash
kubectl expose deployment gateway -n medibook \
  --type=NodePort \
  --name=gateway-nodeport \
  --port=8000 \
  --target-port=8000

# Get the NodePort
kubectl get svc gateway-nodeport -n medibook
# Access at: http://95.111.225.85:<NodePort>
```

### Option B: LoadBalancer
```bash
kubectl expose deployment gateway -n medibook \
  --type=LoadBalancer \
  --name=gateway-lb \
  --port=80 \
  --target-port=8000
```

### Option C: Ingress (Recommended)
```bash
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: medibook-ingress
  namespace: medibook
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - yourdomain.com
    secretName: medibook-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway
            port:
              number: 8000
EOF
```

## Step 8: Verify Deployment

```bash
# Check pods
kubectl get pods -n medibook

# Check services
kubectl get svc -n medibook

# Check logs
kubectl logs -n medibook -l app=medibook,service=gateway -f

# Test API
curl -X GET http://95.111.225.85:8000/health
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n medibook
kubectl logs <pod-name> -n medibook
```

### Image pull errors
```bash
# For local images
kubectl get nodes -o wide
docker images | grep medibook

# For registry issues
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-username \
  --docker-password=your-password \
  -n medibook
```

### Database connection errors
```bash
# Test PostgreSQL connection
kubectl exec -it postgres-xxx -n medibook -- psql -U postgres -d medibook
```

## Useful Commands

```bash
# Watch deployment status
kubectl get pods -n medibook -w

# Stream logs
kubectl logs -f deployment/gateway -n medibook

# Enter pod shell
kubectl exec -it deployment/gateway -n medibook -- /bin/sh

# Restart deployment
kubectl rollout restart deployment/gateway -n medibook

# Scale replicas
kubectl scale deployment gateway --replicas=3 -n medibook

# Get cluster info
kubectl cluster-info
kubectl get nodes -o wide
```

## Next Steps

1. Set up monitoring with Prometheus/Grafana (see `monitoring/` directory)
2. Configure backups for PostgreSQL
3. Set up SSL/TLS certificates
4. Enable HPA (Horizontal Pod Autoscaler)
5. Set resource quotas and limits
