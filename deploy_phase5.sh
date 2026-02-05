#!/bin/bash

# Phase V Deployment Script
# Sets up the event-driven architecture with Kafka and Dapr

set -e  # Exit on any error

echo "🚀 Starting Phase V Deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."
# command -v kubectl >/dev/null 2>&1 || { echo >&2 "❌ kubectl is required but not installed. Aborting."; exit 1; }
# command -v docker >/dev/null 2>&1 || { echo >&2 "❌ docker is required but not installed. Aborting."; exit 1; }
# command -v dapr >/dev/null 2>&1 || { echo >&2 "❌ dapr is required but not installed. Aborting."; exit 1; }

# Start Minikube if not already running
echo "☸️ Checking Minikube status..."
if ! minikube status >/dev/null 2>&1; then
    echo "ernetes Starting Minikube..."
    minikube start --memory=4096 --cpus=2
else
    echo "✅ Minikube is already running"
fi

# Enable ingress addon
echo "🔌 Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable registry

# Install Dapr
echo "🎯 Installing Dapr..."
dapr init -k
kubectl wait --for=condition=ready pod -l app=dapr-operator -n dapr-system --timeout=300s

# Create namespaces
echo "📦 Creating namespaces..."
kubectl create namespace kafka --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Deploy Kafka/Strimzi
echo "afka Deploying Kafka with Strimzi..."
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
kubectl wait --for=condition=ready pod -l name=strimzi-cluster-operator -n kafka --timeout=300s
kubectl apply -f k8s/kafka/kafka-cluster.yaml
kubectl wait --for=condition=ready pod -l strimzi.io/name=todo-kafka-kafka -n kafka --timeout=600s

# Deploy Dapr components
echo "⚙️ Deploying Dapr components..."
kubectl apply -f k8s/dapr/components/

# Build Docker images
echo "🏗️ Building Docker images..."
eval $(minikube docker-env)
cd backend
docker build -t todo-backend:phase5 .
cd ../frontend
docker build -t todo-frontend:phase5 .
docker build -t todo-notification:phase5 -f ../backend/Dockerfile ../backend
docker build -t todo-recurring:phase5 -f ../backend/Dockerfile ../backend
docker build -t todo-audit:phase5 -f ../backend/Dockerfile ../backend

# Deploy applications
echo "🎯 Deploying applications..."
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/todo-backend --timeout=300s
kubectl wait --for=condition=available deployment/todo-frontend --timeout=300s
kubectl wait --for=condition=available deployment/todo-notification --timeout=300s
kubectl wait --for=condition=available deployment/todo-recurring --timeout=300s
kubectl wait --for=condition=available deployment/todo-audit --timeout=300s

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo "🎉 Deployment completed!"
echo "🌐 Frontend: http://$MINIKUBE_IP"
echo "🧪 API: http://$MINIKUBE_IP/api"
echo " daprdashboard Access Dapr dashboard: dapr dashboard"
echo "📋 Check status: kubectl get pods -n todo-app"

echo ""
echo "📋 To test the event-driven architecture:"
echo "1. Visit http://$MINIKUBE_IP to access the Todo app"
echo "2. Create tasks with due dates to trigger reminder events"
echo "3. Mark tasks as complete to trigger recurring task events"
echo "4. Monitor Dapr logs: kubectl logs -l app=todo-backend -n todo-app"