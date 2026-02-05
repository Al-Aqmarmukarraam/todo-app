# Phase V Deployment Guide

## Overview
This guide explains how to deploy the event-driven Todo application with Kafka and Dapr to both local Minikube and cloud Kubernetes clusters.

## Prerequisites

### Local Development
- Docker Desktop or Docker Engine
- Minikube
- kubectl
- Dapr CLI
- Git

### Cloud Deployment
- Azure CLI (for AKS) or Google Cloud SDK (for GKE) or Oracle Cloud CLI
- kubectl
- Dapr CLI

## Local Deployment (Minikube)

### 1. Setup Environment
```bash
# Install prerequisites
# For Windows:
choco install docker-desktop minikube kubectl dapr

# For macOS:
brew install docker minikube kubectl dapr/tap/dapr-cli

# For Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

### 2. Run Deployment Script
```bash
chmod +x deploy_phase5.sh
./deploy_phase5.sh
```

### 3. Verify Deployment
```bash
# Check all pods are running
kubectl get pods -A

# Check Dapr status
dapr status -k

# Access the application
minikube tunnel  # In a separate terminal
minikube service todo-frontend-service --url
```

## Cloud Deployment

### Azure AKS
```bash
# Create AKS cluster
az aks create --resource-group myResourceGroup --name myAKSCluster --node-count 3 --enable-addons monitoring --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# Install Dapr
dapr init -k

# Deploy application using Helm
helm install todo-app helm/todo-app/
```

### Google GKE
```bash
# Create GKE cluster
gcloud container clusters create my-cluster --num-nodes=3

# Get credentials
gcloud container clusters get-credentials my-cluster

# Install Dapr
dapr init -k

# Deploy application
kubectl apply -f k8s/
```

## Architecture Components

### Services
- **Frontend Service**: Next.js frontend application
- **Backend Service**: FastAPI application with Dapr integration
- **Notification Service**: Consumes reminder events
- **Recurring Task Service**: Creates new tasks from completed recurring ones
- **Audit Service**: Maintains audit logs of all operations

### Dapr Components
- **pubsub.kafka**: Kafka-based pub/sub for event streaming
- **state.postgresql**: PostgreSQL-based state management
- **secretstores.kubernetes**: Kubernetes secret store
- **service invocation**: Automatic service-to-service communication

### Kafka Topics
- `task-events`: All task CRUD operations
- `reminders`: Due date reminder events
- `task-updates`: Real-time synchronization events

## Event Flows

### Task Creation
1. Frontend calls Backend API
2. Backend creates task in database
3. Backend publishes "created" event to `task-events` topic via Dapr
4. Audit service consumes event and logs to audit trail

### Reminder Generation
1. Task with due date is created
2. Backend publishes reminder event to `reminders` topic
3. Notification service consumes reminder event
4. Notification is sent to user

### Recurring Task Processing
1. Recurring task is marked as completed
2. Backend publishes "completed" event to `task-events` topic
3. Recurring Task service consumes event
4. New task instance is created for next occurrence

### Real-time Sync
1. Task is updated by one client
2. Backend publishes update to `task-updates` topic
3. WebSocket sync service consumes event
4. Update is broadcast to all connected clients

## Configuration

### Environment Variables
- `DATABASE_URL`: Connection string for PostgreSQL
- `OPENAI_API_KEY`: API key for OpenAI integration
- `DAPR_HTTP_PORT`: Port for Dapr sidecar (default: 3500)
- `DAPR_HOST`: Host for Dapr sidecar (default: localhost)

### Secrets Management
Secrets are managed through Kubernetes secrets and accessed via Dapr:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  database-url: <base64-encoded-value>
  openai-api-key: <base64-encoded-value>
```

## Monitoring and Logging

### Dapr Dashboard
```bash
dapr dashboard -k
```

### Application Logs
```bash
# View all application logs
kubectl logs -l app=todo-backend -n todo-app
kubectl logs -l app=todo-notification -n todo-app
kubectl logs -l app=todo-recurring -n todo-app
kubectl logs -l app=todo-audit -n todo-app
```

### Dapr Component Status
```bash
# Check Dapr component status
dapr components -k
dapr configurations -k
```

## Troubleshooting

### Common Issues

1. **Dapr sidecar not injected**
   ```bash
   # Check if Dapr is running
   dapr status -k

   # Verify annotation in deployment
   kubectl describe deployment todo-backend -n todo-app
   ```

2. **Kafka connectivity issues**
   ```bash
   # Check Kafka pods
   kubectl get pods -n kafka

   # Check Kafka topics
   kubectl exec -it -n kafka todo-kafka-kafka-0 -- bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

3. **Service communication failures**
   ```bash
   # Test service invocation
   dapr invoke --app-id todo-backend --method health
   ```

### Debugging Event Flows
```bash
# Monitor Dapr pub/sub
kubectl logs -l app=dapr-placement-server -n dapr-system

# Check event publishing
kubectl logs -l app=todo-backend -n todo-app | grep -i "published"

# Check event consumption
kubectl logs -l app=todo-notification -n todo-app | grep -i "processing"
```

## Scaling Considerations

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Kafka Partitioning
For high-throughput scenarios, consider increasing Kafka partitions:
```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: task-events
  namespace: kafka
spec:
  partitions: 3  # Increase for higher throughput
  replicas: 1
  config:
    retention.ms: 604800000  # 7 days
    segment.bytes: 1073741824  # 1 GiB
```

## Security Best Practices

1. **Network Policies**: Limit communication between pods
2. **RBAC**: Use least-privilege service accounts
3. **Secrets**: Never store secrets in plain text
4. **TLS**: Enable TLS for Kafka connections
5. **Monitoring**: Implement security monitoring and alerting

## Disaster Recovery

### Backup Strategies
- PostgreSQL: Use automated backups with WAL-G or similar
- Kafka: Ensure replication factor > 1
- Application: Version control for all configurations

### Recovery Procedures
1. Restore from latest backup
2. Redeploy application with `kubectl apply -f k8s/`
3. Verify all services are operational
4. Test event flows manually