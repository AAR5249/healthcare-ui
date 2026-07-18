# MediBook - Smart Healthcare Appointment System

A production-ready microservices backend for healthcare appointment management, demonstrating modern software architecture practices for the SEN3244 Software Architecture course.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Services](#services)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)

## Architecture Overview

### C4 Model

#### System Context

```
┌──────────────────────────────────────────────────────────────┐
│                      Patients & Doctors                        │
│                    (External Users)                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    MediBook System                            │
│                Healthcare Appointment Platform                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    API Gateway                          │ │
│  │                   (Port 8000)                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │              │              │                       │
│         ▼              ▼              ▼                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                  │
│  │  Auth    │   │Appointment│   │Notification│                │
│  │ Service  │   │  Service  │   │  Service   │                │
│  │ (8001)   │   │  (8002)   │   │   (8003)   │                │
│  └──────────┘   └──────────┘   └──────────┘                  │
│         │              │              │                       │
│         └──────────────┴──────────────┘                       │
│                        │                                      │
│         ┌──────────────┴──────────────┐                      │
│         ▼                             ▼                       │
│  ┌──────────────┐            ┌──────────────┐                 │
│  │  PostgreSQL │            │    Redis     │                 │
│  │   Database    │            │ Message Broker│               │
│  └──────────────┘            └──────────────┘                 │
└───────────────────────────────────────────────────────────────┘
```

#### Container Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Docker Network                                 │
│                                                                         │
│  ┌─────────────┐                                                       │
│  │   Gateway   │─────────────────────────────────────────────────────┐ │
│  │   :8000     │   Routes: /auth/* /appointments/* /notifications/*  │ │
│  │             │   - JWT Validation                                   │ │
│  │             │   - Rate Limiting                                     │ │
│  │             │   - Request Logging                                   │ │
│  └─────────────┘                                                       │
│        │               │               │                                │
│        ▼               ▼               ▼                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐                 │
│  │Auth Service │ │ Appointment │ │Notification Svc │                 │
│  │   :8001     │ │  Service    │ │     :8003       │                 │
│  │             │ │   :8002     │ │                 │                 │
│  │ - Register  │ │             │ │ - Email sending │                 │
│  │ - Login     │ │ - CRUD      │ │ - History       │                 │
│  │ - Refresh   │ │ - Slots     │ │ - Read status   │                 │
│  │ - Logout    │ │ - Events    │ │                 │                 │
│  └─────────────┘ └─────────────┘ └─────────────────┘                 │
│        │               │               │                │           │
│        └───────────────┴───────────────┘                │           │
│                         │                                 │           │
│         ┌───────────────┴───────────────┐                │           │
│         ▼                               ▼                ▼           │
│  ┌─────────────┐               ┌─────────────┐      ┌─────────────┐ │
│  │ PostgreSQL  │               │    Redis    │      │ Prometheus  │ │
│  │   :5432     │               │   :6379     │      │   :9090     │ │
│  └─────────────┘               └─────────────┘      └─────────────┘ │
│                                                             │         │
│                                                      ┌─────────────┐ │
│                                                      │   Grafana   │ │
│                                                      │   :3000     │ │
│                                                      └─────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 (TypeScript) |
| Framework | Express.js |
| Database | PostgreSQL 16 (Supabase) |
| ORM | Prisma |
| Cache/Broker | Redis |
| Validation | Zod |
| Logging | Winston |
| Testing | Jest + Supertest |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | Jenkins |
| IaC | Ansible |
| Monitoring | Prometheus + Grafana |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Running with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd medibook

# Create environment files
cp auth-service/.env.example auth-service/.env
cp appointment-service/.env.example appointment-service/.env
cp notification-service/.env.example notification-service/.env
cp gateway/.env.example gateway/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Running Locally (Development)

```bash
# Install dependencies for shared packages
cd shared/packages/types && npm install && npm run build
cd ../utils && npm install && npm run build
cd ../middleware && npm install && npm run build

# Install and run each service
cd auth-service && npm install && npm run dev
cd appointment-service && npm install && npm run dev
cd notification-service && npm install && npm run dev
cd gateway && npm install && npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8000 |
| Auth Service | http://localhost:8001 |
| Appointment Service | http://localhost:8002 |
| Notification Service | http://localhost:8003 |
| Swagger UI | http://localhost:8000/api-docs |
| Grafana | http://localhost:3000 (admin/admin123) |
| Prometheus | http://localhost:9090 |

## Services

### API Gateway (Port 8000)

Central entry point for all API requests.

**Features:**
- JWT validation on protected routes
- Rate limiting (100 requests per 15 min)
- Request logging with Morgan
- Swagger UI documentation
- Proxy routing to microservices

**Routes:**
- `/auth/*` → Auth Service
- `/appointments/*` → Appointment Service
- `/notifications/*` → Notification Service

### Auth Service (Port 8001)

Handles user authentication and authorization.

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create new user account |
| POST | /auth/login | Authenticate and get tokens |
| POST | /auth/refresh | Rotate refresh token |
| POST | /auth/logout | Logout and invalidate tokens |
| GET | /auth/me | Get current user info |
| GET | /auth/health | Health check |

### Appointment Service (Port 8002)

Manages appointments and doctor schedules.

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /appointments | List appointments (filterable) |
| POST | /appointments | Create new appointment |
| GET | /appointments/:id | Get appointment by ID |
| PATCH | /appointments/:id | Update appointment status |
| DELETE | /appointments/:id | Delete appointment |
| GET | /appointments/slots/:doctorId | Get available time slots |
| GET | /appointments/health | Health check |

### Notification Service (Port 8003)

Handles email notifications and notification history.

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications/:userId | Get user notifications |
| PATCH | /notifications/:id/read | Mark as read |
| PATCH | /notifications/:userId/read-all | Mark all as read |
| DELETE | /notifications/:id | Delete notification |
| GET | /notifications/health | Health check |

## API Documentation

Access interactive API documentation at: http://localhost:8000/api-docs

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-access-token>
```

### Example Requests

**Register User:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }'
```

**Create Appointment:**
```bash
curl -X POST http://localhost:8000/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "date": "2026-01-20",
    "startTime": "09:00",
    "endTime": "09:30",
    "reason": "Annual checkup"
  }'
```

## Environment Variables

### Gateway (.env)
```env
NODE_ENV=development
PORT=8000
JWT_SECRET=your-jwt-secret
AUTH_SERVICE_URL=http://auth-service:8001
APPOINTMENT_SERVICE_URL=http://appointment-service:8002
NOTIFICATION_SERVICE_URL=http://notification-service:8003
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Auth Service (.env)
```env
NODE_ENV=development
PORT=8001
DATABASE_URL=postgresql://postgres:password@postgres:5432/medibook
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
```

### Appointment Service (.env)
```env
NODE_ENV=development
PORT=8002
DATABASE_URL=postgresql://postgres:password@postgres:5432/medibook
REDIS_URL=redis://redis:6379
NOTIFICATION_CHANNEL=appointment_events
```

### Notification Service (.env)
```env
NODE_ENV=development
PORT=8003
DATABASE_URL=postgresql://postgres:password@postgres:5432/medibook
REDIS_URL=redis://redis:6379
NOTIFICATION_CHANNEL=appointment_events
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@medibook.com
```

## Testing

### Run Tests

```bash
# Run tests for a specific service
cd auth-service
npm test

# Run with coverage
npm run test:coverage
```

### Test Coverage Target

All services target **80%+ test coverage** for:
- Branches
- Functions
- Lines
- Statements

### Test Types

- **Unit Tests**: Service layer functions with mocked dependencies
- **Integration Tests**: API routes using supertest
- **Coverage Reports**: Generated in `coverage/` directory

## Deployment

### Kubernetes Deployment

```bash
# Apply ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml

# Deploy all services
kubectl apply -f k8s/auth/deployment.yaml
kubectl apply -f k8s/appointment/deployment.yaml
kubectl apply -f k8s/notification/deployment.yaml
kubectl apply -f k8s/gateway/deployment.yaml

# Or use the deploy script
cd k8s && ./deploy.sh medibook
```

### Ansible Deployment

```bash
# Install dependencies on VPS
ansible-playbook -i ansible/inventory.ini ansible/install-dependencies.yml

# Deploy services
ansible-playbook -i ansible/inventory.ini ansible/deploy-services.yml
```

## Monitoring

### Prometheus

Metrics are exposed at `/metrics` endpoint on each service.

**Collected Metrics:**
- `http_requests_total` - Total request count
- `http_request_duration_seconds` - Request duration histogram
- Default Node.js metrics

**Access:** http://localhost:9090

### Grafana

Pre-configured dashboard showing:
- Request rate by service
- Error rate percentage
- Response time (p95)
- Service health status
- Memory and CPU usage

**Access:** http://localhost:3000 (admin/admin123)

### Alerting Rules

Defined in `monitoring/alert_rules.yml`:
- ServiceDown (critical)
- HighErrorRate (>5% errors)
- HighResponseTime (>2s p95)
- HighMemoryUsage (>512MB)

## Project Structure

```
medibook/
├── gateway/                    # API Gateway
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── auth-service/               # Authentication Service
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── tests/
│   │   └── index.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── package.json
├── appointment-service/        # Appointment Service
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── eventPublisher/
│   │   ├── config/
│   │   ├── tests/
│   │   └── index.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── package.json
├── notification-service/       # Notification Service
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── eventListener/
│   │   ├── config/
│   │   ├── tests/
│   │   └── index.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── package.json
├── shared/                      # Shared packages
│   ├── packages/
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utilities (logger, response, validation)
│   │   └── middleware/         # Express middleware
├── k8s/                         # Kubernetes manifests
│   ├── auth/
│   ├── appointment/
│   ├── notification/
│   ├── gateway/
│   ├── configmap.yaml
│   └── deploy.sh
├── ansible/                     # Ansible playbooks
│   ├── install-dependencies.yml
│   ├── deploy-services.yml
│   └── inventory.ini
├── monitoring/                  # Monitoring config
│   ├── prometheus.yml
│   ├── alert_rules.yml
│   └── grafana/
│       ├── provisioning/
│       └── dashboards/
├── docker-compose.yml           # Docker Compose setup
├── Jenkinsfile                  # CI/CD pipeline
└── README.md
```

## License

MIT License - Educational Project for SEN3244 Software Architecture Course
