#!/bin/bash

# Phase IV Deployment Script for Todo Chatbot Application
# This script resumes deployment from Docker image build completion
# and proceeds with Helm deployment using existing charts

set -e  # Exit on any error

echo "🚀 Starting Phase IV: Todo Chatbot Kubernetes Deployment"
echo "========================================================"

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed or not in PATH"
        exit 1
    fi

    # Check if Minikube is available
    if ! command -v minikube &> /dev/null; then
        echo "❌ Minikube is not installed or not in PATH"
        exit 1
    fi

    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed or not in PATH"
        exit 1
    fi

    # Check if Helm is available
    if ! command -v helm &> /dev/null; then
        echo "❌ Helm is not installed or not in PATH"
        exit 1
    fi

    echo "✅ All prerequisites are installed"
}

# Function to start Minikube
start_minikube() {
    echo "🔄 Starting Minikube cluster..."

    # Check if Minikube is already running
    if minikube status &> /dev/null; then
        echo "✅ Minikube is already running"
        return 0
    fi

    # Start Minikube with Docker driver
    echo "🔧 Starting Minikube with Docker driver..."
    minikube start --driver=docker

    # Wait for Minikube to be ready
    echo "⏳ Waiting for Minikube to be ready..."
    kubectl wait --for=condition=Ready pods --all --namespace=kube-system --timeout=120s

    echo "✅ Minikube cluster is running"
}

# Function to build Docker images
build_docker_images() {
    echo "🐳 Building Docker images..."

    # Point Docker CLI to Minikube registry
    eval $(minikube docker-env)

    # Build frontend image
    echo "🏗️  Building frontend image..."
    cd frontend
    docker build -t todo-frontend:latest .
    cd ..

    # Build backend image
    echo "🏗️  Building backend image..."
    cd backend
    docker build -t todo-backend:latest .
    cd ..

    # Build MCP server image
    echo "🏗️  Building MCP server image..."
    cd mcp-server
    docker build -t todo-mcp-server:latest .
    cd ..

    echo "✅ All Docker images built successfully"
}

# Function to deploy using Helm
deploy_helm() {
    echo "⎈ Deploying application with Helm..."

    # Navigate to helm directory
    cd helm

    # Check if secrets are configured
    echo "🔐 Checking for required secrets..."
    if [ ! -f secrets.env ]; then
        echo "⚠️  Warning: secrets.env file not found. Please ensure secrets are configured."
        echo "   Create a secrets.env file with your API keys and database credentials."
    fi

    # Install the Helm chart
    echo "📦 Installing Helm chart..."
    helm install todo-chatbot . \
        --set frontend.image.tag=latest \
        --set backend.image.tag=latest \
        --set mcpServer.image.tag=latest \
        --wait \
        --timeout=10m

    echo "✅ Helm chart installed successfully"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."

    # Wait for all pods to be ready
    echo "⏳ Waiting for all pods to be ready..."
    kubectl wait --for=condition=Ready pods --selector=app.kubernetes.io/instance=todo-chatbot --timeout=300s

    # Check pod status
    echo "📋 Pod status:"
    kubectl get pods -l app.kubernetes.io/instance=todo-chatbot

    # Check services
    echo "📡 Service status:"
    kubectl get svc -l app.kubernetes.io/instance=todo-chatbot

    # Get application URL
    echo "🔗 Application endpoints:"
    minikube service todo-chatbot-todo-frontend --url || echo "Frontend service may not be exposed via Minikube"

    # Show ingress if available
    kubectl get ingress || echo "Ingress may not be configured"

    echo "✅ Deployment verification completed"
}

# Function to display application info
display_app_info() {
    echo "🌐 Application Information:"
    echo "==========================="

    echo "Frontend: http://todo-chatbot.local (via ingress)"
    echo "Backend: http://todo-backend:8000 (internal service)"
    echo "MCP Server: http://mcp-server:8001 (internal service)"

    echo ""
    echo "To access the application:"
    echo "1. Add '127.0.0.1 todo-chatbot.local' to your hosts file"
    echo "2. Or use port forwarding: kubectl port-forward svc/todo-chatbot-todo-frontend 3000:3000"
    echo ""
    echo "To check logs: kubectl logs -l app.kubernetes.io/instance=todo-chatbot"
    echo "To uninstall: helm uninstall todo-chatbot"
}

# Main execution
main() {
    echo "Starting deployment process..."

    check_prerequisites
    start_minikube
    build_docker_images
    deploy_helm
    verify_deployment
    display_app_info

    echo ""
    echo "🎉 Phase IV Deployment Completed Successfully!"
    echo "=============================================="
    echo "Your Todo Chatbot application is now running on Kubernetes!"
}

# Run main function
main "$@"