# Phase IV: Todo Chatbot Kubernetes Deployment

## Current Status
Based on the execution logs found in `Phase_IV/logs/`, the deployment has encountered issues due to Docker not running properly on the system. Here's the current state:

- ✅ Frontend code is fixed and ready for deployment
- ✅ Backend code is ready for deployment
- ✅ MCP server Dockerfile has been created
- ✅ Helm charts are properly configured
- ❌ Docker is not running properly (connection issues)
- ❌ Minikube cannot connect to Docker daemon
- ❌ Docker images were not built successfully

## Prerequisites

Before proceeding with the deployment, ensure the following are installed and running:

1. **Docker Desktop** - With sufficient memory allocation (recommended 4GB+)
2. **Minikube** - For local Kubernetes cluster
3. **kubectl** - Kubernetes command-line tool
4. **Helm 3.x** - Package manager for Kubernetes

## Resolution Steps

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully initialize and show "Docker Desktop is running" status
- Ensure it has adequate resources allocated (Settings > Resources)

### 2. Verify Docker Connectivity
```bash
docker version
docker ps
```

### 3. Run the Deployment Script
Once Docker is running properly, execute the deployment script:

```bash
chmod +x deploy_phase_iv.sh
./deploy_phase_iv.sh
```

## Alternative Manual Deployment

If the script doesn't work, you can deploy manually:

### Step 1: Start Minikube
```bash
minikube start --driver=docker
```

### Step 2: Set Docker Environment to Minikube
```bash
eval $(minikube docker-env)
```

### Step 3: Build Docker Images
```bash
# Build frontend
cd frontend
docker build -t todo-frontend:latest .
cd ..

# Build backend
cd backend
docker build -t todo-backend:latest .
cd ..

# Build MCP server
cd mcp-server
docker build -t todo-mcp-server:latest .
cd ..
```

### Step 4: Deploy with Helm
```bash
cd helm
helm install todo-chatbot . \
  --set frontend.image.tag=latest \
  --set backend.image.tag=latest \
  --set mcpServer.image.tag=latest \
  --wait \
  --timeout=10m
```

### Step 5: Verify Deployment
```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

## Troubleshooting

### Docker Connection Issues
- Restart Docker Desktop
- Increase Docker memory allocation
- Check Windows Defender or antivirus interference
- Ensure no other VMs are consuming resources

### Minikube Startup Issues
- Stop any existing Minikube instances: `minikube stop`
- Delete and recreate: `minikube delete && minikube start --driver=docker`

### Image Build Failures
- Check available disk space
- Clear Docker build cache: `docker builder prune`
- Ensure all required files exist in frontend/backend/mcp-server directories

## Expected Outcome

Once successfully deployed, you should have:

- A running Kubernetes cluster with Minikube
- Docker images for frontend, backend, and MCP server
- Deployed services accessible via Kubernetes
- Functional Todo Chatbot application
- Helm-managed application lifecycle

## Accessing the Application

After deployment, access the application at:
- Frontend: http://todo-chatbot.local (add to hosts file: `127.0.0.1 todo-chatbot.local`)
- Or use port forwarding: `kubectl port-forward svc/todo-chatbot-todo-frontend 3000:3000`

## Cleanup

To remove the deployment:
```bash
helm uninstall todo-chatbot
minikube stop
```