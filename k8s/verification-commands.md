# Kubernetes Verification Commands for Phase 4

## Pre-deployment Checks

### 1. Verify Kubernetes Cluster Status
```bash
kubectl cluster-info
kubectl get nodes
kubectl get cs  # ComponentStatus (deprecated but still useful)
```

### 2. Verify Minikube Status (if using Minikube)
```bash
minikube status
minikube ip
```

### 3. Verify Available Resources
```bash
kubectl top nodes
kubectl describe nodes
```

## Deployment Commands

### 1. Apply the Kubernetes Manifest
```bash
kubectl apply -f phase4-deployment.yaml
```

### 2. Alternative: Apply Individual Components
```bash
kubectl apply -f deployments/
kubectl apply -f services/  # if separate service files exist
kubectl apply -f ingress.yaml
```

## Post-deployment Verification

### 1. Check Pod Status
```bash
# Check all pods
kubectl get pods

# Check pods with more details
kubectl get pods -o wide

# Check pods for specific application
kubectl get pods -l app=todo-backend
kubectl get pods -l app=todo-frontend

# Watch pods until they're ready
kubectl get pods --watch
```

### 2. Check Service Status
```bash
# Check all services
kubectl get svc

# Check specific services
kubectl get svc todo-backend-service
kubectl get svc todo-frontend-service
```

### 3. Check Deployment Status
```bash
# Check all deployments
kubectl get deployments

# Check specific deployments
kubectl get deployments todo-backend
kubectl get deployments todo-frontend

# Get detailed deployment status
kubectl rollout status deployment/todo-backend
kubectl rollout status deployment/todo-frontend
```

### 4. Check Ingress Status
```bash
# Check ingress
kubectl get ingress
kubectl describe ingress todo-app-ingress
```

### 5. Check Events (for troubleshooting)
```bash
# Check cluster events
kubectl get events --sort-by='.lastTimestamp'

# Check events for specific namespace
kubectl get events -n default --sort-by='.lastTimestamp'
```

## Health Checks

### 1. Check Pod Logs
```bash
# Check backend logs
kubectl logs -l app=todo-backend

# Check frontend logs
kubectl logs -l app=todo-frontend

# Follow logs in real-time
kubectl logs -l app=todo-backend -f
kubectl logs -l app=todo-frontend -f

# Check previous container logs (if restarted)
kubectl logs -l app=todo-backend --previous
```

### 2. Describe Pods for Detailed Information
```bash
# Describe backend pod
kubectl describe pods -l app=todo-backend

# Describe frontend pod
kubectl describe pods -l app=todo-frontend
```

### 3. Check Resource Usage
```bash
# Check resource usage of pods
kubectl top pods

# Check resource limits and requests
kubectl describe pods -l app=todo-backend
kubectl describe pods -l app=todo-frontend
```

## Network Connectivity Checks

### 1. Test Internal Service Connectivity
```bash
# Exec into a pod to test connectivity
kubectl exec -it deployment/todo-frontend -- nslookup todo-backend-service
kubectl exec -it deployment/todo-frontend -- curl -I http://todo-backend-service:80/health
```

### 2. Port Forward for Local Testing
```bash
# Port forward frontend
kubectl port-forward svc/todo-frontend-service 3000:80

# Port forward backend
kubectl port-forward svc/todo-backend-service 8000:80
```

## Dapr-Specific Checks (since the app uses Dapr)

### 1. Check Dapr Status
```bash
dapr status -k
```

### 2. Check Dapr Components
```bash
dapr components -k
```

### 3. Check Dapr Sidecars
```bash
kubectl get pods -a  # Shows all pods including sidecars
kubectl describe pod <pod-name>  # Look for dapr sidecar containers
```

## Troubleshooting Commands

### 1. If Pods are Stuck in Pending State
```bash
kubectl describe pods -l app=todo-backend
kubectl describe pods -l app=todo-frontend
```

### 2. If Pods are in CrashLoopBackOff
```bash
kubectl logs -l app=todo-backend --previous
kubectl logs -l app=todo-frontend --previous
```

### 3. Check Resource Limits
```bash
kubectl describe nodes | grep -A 10 Allocated
```

## Cleanup Commands

### 1. Delete the Deployment
```bash
kubectl delete -f phase4-deployment.yaml
```

### 2. Delete Specific Resources
```bash
kubectl delete deployment todo-backend todo-frontend
kubectl delete service todo-backend-service todo-frontend-service
kubectl delete ingress todo-app-ingress
```

## Complete Verification Script

```bash
#!/bin/bash
echo "🔍 Starting comprehensive verification..."

echo "📋 Checking cluster status..."
kubectl cluster-info
kubectl get nodes

echo "📋 Checking deployments..."
kubectl get deployments

echo "📋 Checking pods..."
kubectl get pods

echo "📋 Checking services..."
kubectl get svc

echo "📋 Checking ingress..."
kubectl get ingress

echo "📋 Checking events..."
kubectl get events --sort-by='.lastTimestamp' | tail -20

echo "✅ Verification complete!"
```