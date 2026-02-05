# Todo Chatbot Deployment Process

## Overview
This document outlines the deployment process for the Todo Chatbot application on a Kubernetes cluster using Helm charts.

## Prerequisites
- Kubernetes cluster (tested with Minikube)
- Helm 3.x installed
- Docker images built and accessible
- kubectl configured to connect to the cluster

## Deployment Steps

### 1. Prepare Docker Images
```bash
# Build frontend image
cd frontend
docker build -t todo-frontend:latest .
docker tag todo-frontend:latest todo-frontend:latest

# Build backend image
cd ../backend
docker build -t todo-backend:latest .
docker tag todo-backend:latest todo-backend:latest

# Build MCP server image
cd ../mcp-server
docker build -t todo-mcp-server:latest .
docker tag todo-mcp-server:latest todo-mcp-server:latest
```

### 2. Push Images to Registry (if using remote cluster)
```bash
# For Minikube, images are available locally
# For remote clusters, push to registry:
# docker push todo-frontend:latest
# docker push todo-backend:latest
# docker push todo-mcp-server:latest
```

### 3. Deploy Using Helm
```bash
# Navigate to helm directory
cd ../helm

# Install the chart
helm install todo-chatbot . \
  --set frontend.image.tag=latest \
  --set backend.image.tag=latest \
  --set mcpServer.image.tag=latest \
  --set secrets.openai-secret.api-key="your-openai-api-key"

# Or use the values file
helm install todo-chatbot . -f values.yaml
```

### 4. Verify Installation
```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -l app.kubernetes.io/name=todo-frontend
kubectl logs -l app.kubernetes.io/name=todo-backend
```

### 5. Access the Application
```bash
# Get the external IP/URL
minikube service todo-chatbot-todo-frontend --url

# Or use ingress if configured
kubectl get ingress
```

## Configuration Values
The deployment uses the following key configuration values:

- `frontend.image.repository`: Repository for frontend image
- `backend.image.repository`: Repository for backend image
- `mcpServer.image.repository`: Repository for MCP server image
- `secrets.openai-secret.api-key`: OpenAI API key for AI functionality
- `secrets.database-secret.url`: Database connection string

## Troubleshooting

### Common Issues
1. **ImagePullBackOff**: Ensure images are pushed to the registry or available locally
2. **CrashLoopBackOff**: Check logs for configuration errors
3. **Service Unavailable**: Verify ingress controller is running

### Useful Commands
```bash
# Check all resources
kubectl get all

# Describe a specific pod for details
kubectl describe pod <pod-name>

# Port forward for testing
kubectl port-forward svc/todo-chatbot-todo-frontend 3000:3000
kubectl port-forward svc/todo-chatbot-todo-backend 8000:8000
```

## Cleanup
```bash
# Uninstall the release
helm uninstall todo-chatbot

# Delete persistent volumes if needed
kubectl delete pvc -l app=todo-chatbot
```