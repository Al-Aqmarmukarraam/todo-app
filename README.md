# Cloud Native Todo Chatbot - Phase IV & V Deployment Guide

## Overview
This repository contains a cloud-native Todo Chatbot application with event-driven architecture using Kafka and Dapr. The system is designed for deployment on both local Kubernetes (Minikube) and cloud platforms (AKS/GKE/OKE).

## Architecture Components

### Services
- **Frontend**: Next.js application for user interface
- **Backend**: FastAPI application with Dapr integration
- **Recurring Task Service**: Handles recurring task creation
- **Notification Service**: Manages reminders and notifications
- **Audit Service**: Tracks all task operations

### Infrastructure
- **Kafka**: Event streaming via Strimzi
- **Dapr**: Distributed application runtime for pub/sub, state management, and service invocation
- **PostgreSQL**: Persistent data storage
- **Helm**: Package management for Kubernetes deployments

## Deployment Process

### Phase IV: Local Kubernetes Deployment

#### Prerequisites
- Docker Desktop
- Minikube
- kubectl
- Helm
- Dapr CLI

#### Steps
1. Start Minikube:
   ```bash
   minikube start --driver=docker
   ```

2. Install Dapr:
   ```bash
   dapr init -k
   ```

3. Deploy Kafka:
   ```bash
   kubectl create namespace kafka
   kubectl create -f https://strimzi.io/install/latest?namespace=kafka -n kafka
   kubectl apply -f k8s/kafka/kafka-cluster.yaml
   ```

4. Deploy Dapr components:
   ```bash
   kubectl apply -f k8s/dapr/components/
   ```

5. Build and deploy applications:
   ```bash
   # Build images in Minikube context
   eval $(minikube docker-env)
   cd backend && docker build -t todo-backend:latest . && cd ..
   cd frontend && docker build -t todo-frontend:latest . && cd ..
   
   # Deploy with Helm
   helm install todo-chatbot ./helm
   ```

### Phase V: Advanced Cloud Deployment

#### Cloud-Specific Configuration
The `k8s/cloud-values.yaml` file contains optimized configurations for cloud deployments including:
- Higher resource limits
- Auto-scaling configurations
- LoadBalancer services
- External database/Kafka configurations
- Security policies

#### CI/CD Pipeline
The `.github/workflows/deploy.yml` file implements a complete CI/CD pipeline with:
- Automated testing
- Container image building and pushing
- Secure deployment to cloud clusters
- Health verification

## Event-Driven Architecture

### Kafka Topics
- `task-events`: All task lifecycle events
- `reminders`: Task reminder events
- `recurring-tasks`: Recurring task definitions

### Dapr Components
- **pubsub.kafka**: Event publishing/subscribing
- **state.postgresql**: State management
- **secretstores.kubernetes**: Secure secret management

## Advanced Features

### Recurring Tasks
- Tasks can be configured to repeat daily, weekly, monthly
- Automatic creation of future instances

### Reminders & Notifications
- Due date reminders
- Push notifications
- Email alerts

### Task Management
- Priorities (high, medium, low)
- Tags and categories
- Advanced filtering and sorting
- Due dates and deadlines

## Monitoring & Observability

### Included Components
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation
- Tempo for distributed tracing

### Health Checks
- Dapr health endpoints
- Application health endpoints
- Kafka connectivity checks

## Security

### Authentication
- JWT-based authentication
- Secure token storage
- Session management

### Authorization
- Role-based access control
- API rate limiting
- Input validation

### Secrets Management
- Kubernetes secrets
- Dapr secret store integration
- Encrypted transmission

## Scaling & Resilience

### Auto-scaling
- Horizontal Pod Autoscaler
- Resource-based scaling triggers
- Custom metrics integration

### High Availability
- Multiple replicas
- Pod disruption budgets
- Health probes and restart policies

## Troubleshooting

### Common Issues
1. **Dapr Sidecar Not Injected**: Ensure Dapr is installed and annotations are correct
2. **Kafka Connectivity**: Verify Kafka cluster is running and accessible
3. **Service Discovery**: Check Dapr service invocation configuration

### Useful Commands
```bash
# Check Dapr status
dapr status -k

# View Dapr components
dapr components -k

# Check application logs
kubectl logs -l app=todo-backend

# Access Dapr dashboard
dapr dashboard -k
```

## Development

### Local Development
- Use the `deploy_phase_iv.sh` script for local deployment
- Use the `deploy_phase5.sh` script for event-driven architecture deployment

### Testing
- Unit tests for individual components
- Integration tests for service communication
- End-to-end tests for complete workflows