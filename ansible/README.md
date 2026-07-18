# MediBook Ansible Playbooks

This directory contains Ansible playbooks for deploying the MediBook healthcare appointment system.

## Prerequisites

1. Ansible installed on control machine
2. SSH access to target servers
3. Python 3 on target servers

## Directory Structure

```
ansible/
├── inventory.ini           # Server inventory
├── install-dependencies.yml # Install Docker, Node.js, PostgreSQL
├── deploy-services.yml     # Deploy MediBook services
└── README.md               # This file
```

## Quick Start

### 1. Update Inventory

Edit `inventory.ini` with your server details:

```ini
[production]
medibook-prod-01 ansible_host=YOUR_SERVER_IP ansible_user=ubuntu
```

### 2. Install Dependencies

Run the installation playbook:

```bash
ansible-playbook -i inventory.ini install-dependencies.yml
```

This will install:
- Docker
- Docker Compose
- Node.js 20
- PostgreSQL 16
- Redis
- Nginx
- UFW Firewall

### 3. Deploy Services

Copy the docker-compose.yml to the server and run:

```bash
ansible-playbook -i inventory.ini deploy-services.yml
```

## Playbook Details

### install-dependencies.yml

Installs all required infrastructure components:
- Docker and Docker Compose for containerization
- Node.js 20 for JavaScript runtime
- PostgreSQL 16 for database
- Redis for message broker
- Nginx as reverse proxy
- UFW firewall for security

### deploy-services.yml

Deploys the MediBook services:
- Pulls latest Docker images
- Starts containers via Docker Compose
- Performs health checks
- Reports deployment status

## Variables

Default variables can be overridden in `group_vars/all.yml`:

```yaml
project_dir: /opt/medibook
node_version: "20"
postgres_version: "16"
docker_compose_version: "2.23.0"
```

## Troubleshooting

### Check service status

```bash
ansible all -i inventory.ini -m shell -a "docker ps"
```

### View container logs

```bash
ansible all -i inventory.ini -m shell -a "docker logs medibook-gateway"
```

### Restart services

```bash
ansible all -i inventory.ini -m shell -a "cd /opt/medibook && docker-compose restart"
```
