# Todo Chatbot - Phase IV Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Containerization](#containerization)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [AI-Assisted Operations](#ai-assisted-operations)
6. [Configuration](#configuration)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## Overview
This document provides comprehensive documentation for the Todo Chatbot application deployed on Kubernetes. The application consists of a Next.js frontend, FastAPI backend, and MCP server for AI-assisted task management.

### Components
- **Frontend**: Next.js application providing chat interface
- **Backend**: FastAPI server handling API requests and authentication
- **MCP Server**: Model Context Protocol server providing deterministic tools
- **Database**: PostgreSQL for data persistence

### Features
- Natural language task management
- User authentication and authorization
- Conversation history preservation
- AI-powered task operations

## Architecture

### System Design
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Frontend  │    │   Backend   │
│   Client    │───▶│   (Next.js) │───▶│  (FastAPI)  │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
                                          ┌────▼────┐
                                          │ MCP     │
                                          │ Server  │
                                          └────┬────┘
                                               │
                                          ┌────▼────┐
                                          │Database │
                                          │(PostgreSQL)│
                                          └─────────┘
```

### Data Flow
1. User sends natural language command via frontend
2. Frontend sends message to backend API
3. Backend authenticates user and forwards to AI agent
4. AI agent determines appropriate MCP tool
5. MCP server executes database operation
6. Results returned to backend and then to frontend
7. Response displayed to user

### State Management
- All state persisted in database
- Conversation history reconstructed per request
- Stateless server architecture for scalability

## Containerization

### Frontend Container
- Base image: node:20-alpine
- Optimized with multi-stage build
- Security: Non-root user (UID 1001)
- Tools: dumb-init for signal handling
- Size: Minimized through build optimization

### Backend Container
- Base image: python:3.11-slim
- Dependencies: FastAPI, SQLModel, OpenAI
- Security: Non-root user (appuser)
- Port: 8000

### MCP Server Container
- Base image: python:3.11-slim
- Dependencies: FastAPI, SQLModel
- Security: Non-root user
- Port: 8001

### Security Optimizations
- Minimal base images (Alpine/slim variants)
- Non-root users in containers
- Removed build dependencies in final images
- Proper file permissions

## Kubernetes Deployment

### Helm Chart Structure
```
helm/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration
├── templates/          # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── networkpolicy.yaml
│   └── _helpers.tpl
└── charts/             # Subcharts
    ├── todo-frontend/
    └── todo-backend/
```

### Deployment Configuration
- **Frontend**: 1 replica, resource limits (500m CPU, 512Mi memory)
- **Backend**: 1 replica, resource limits (500m CPU, 512Mi memory)
- **MCP Server**: 1 replica, resource limits (300m CPU, 256Mi memory)
- **Service Type**: ClusterIP by default
- **Ingress**: Configurable hostname and path

### Network Policies
- Ingress: Allow traffic from ingress controller and frontend
- Egress: Allow external access for OpenAI API, database access, and cluster-internal traffic
- Secured communication between components

### Secrets Management
- OpenAI API key stored in Kubernetes secret
- Database credentials stored in Kubernetes secret
- Environment variables mounted from secrets

## AI-Assisted Operations

### MCP Tools
1. **add_task**: Create new tasks with title, description, due date, priority
2. **list_tasks**: Retrieve user tasks with filtering and sorting
3. **complete_task**: Mark tasks as completed
4. **delete_task**: Remove tasks from user list
5. **update_task**: Modify task properties

### Natural Language Processing
- Intent recognition for task operations
- Entity extraction for task details
- Context preservation across conversations
- Ambiguity resolution with clarifying questions

### Conversation Flow
1. User sends natural language input
2. AI interprets intent and extracts parameters
3. Appropriate MCP tool is called
4. Database operation is executed
5. Response is formatted and returned to user

## Configuration

### Environment Variables

#### Frontend
- `BACKEND_URL`: URL of backend service
- `NEXT_PUBLIC_*`: Public environment variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `MCP_SERVER_URL`: MCP server endpoint
- `JWT_SECRET_KEY`: JWT signing key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

#### MCP Server
- `DATABASE_URL`: PostgreSQL connection string
- `MCP_PORT`: Port for MCP server

### ConfigMaps
- Application-level configuration
- Logging levels
- Feature flags

### Customizable Values
Helm chart supports customization through values.yaml:
- Replica counts
- Resource limits and requests
- Image repositories and tags
- Service types and ports
- Ingress configuration

## Security

### Authentication
- JWT-based authentication
- Better Auth compatibility
- Token validation middleware
- Session management

### Authorization
- User ownership validation
- Permission checks for all operations
- MCP-level authorization for tool calls
- Database-level row-level security

### Network Security
- Network policies restricting traffic
- TLS encryption for ingress
- Service mesh communication
- Isolated namespaces

### Secrets Management
- Kubernetes secrets for sensitive data
- No hardcoded credentials
- Environment variable mounting
- RBAC for secret access

### Container Security
- Non-root users
- Read-only root filesystem (where possible)
- Seccomp and AppArmor profiles
- Minimal attack surface

## Troubleshooting

### Common Issues

#### Deployment Failures
- ImagePullBackOff: Check image repository and credentials
- CrashLoopBackOff: Check logs for configuration errors
- Init:CrashLoopBackOff: Verify database connectivity

#### AI Agent Issues
- Tool call failures: Verify MCP server connectivity
- Authentication errors: Check JWT configuration
- Permission denied: Verify user ownership

#### Performance Issues
- High latency: Check resource limits and scaling
- Database timeouts: Optimize queries and connections
- AI response delays: Check OpenAI API rate limits

### Diagnostic Commands
```bash
# Check all resources
kubectl get all -n <namespace>

# View logs
kubectl logs -l app=<app-name> -n <namespace>

# Describe pod for details
kubectl describe pod <pod-name> -n <namespace>

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Port forward for testing
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>
```

### Health Checks
- Backend: `/health` endpoint
- Frontend: Root path (`/`) returns HTML
- MCP Server: `/health` endpoint
- Database: Connection verification

## Maintenance

### Scaling
- Horizontal Pod Autoscaler (HPA) configuration
- Resource-based scaling triggers
- Load testing procedures

### Backup and Recovery
- Database backup procedures
- Persistent volume snapshots
- Disaster recovery plan

### Monitoring
- Resource utilization metrics
- Application performance monitoring
- Error rate tracking
- User activity logging

### Updates
- Zero-downtime deployment strategy
- Blue-green deployment pattern
- Configuration management
- Rollback procedures

### Lifecycle Management
- Image update procedures
- Dependency management
- Security patching
- Version upgrade process

## Best Practices

### Development
- Statelessness: No in-memory state between requests
- Idempotency: Safe to retry operations
- Circuit breakers: Handle downstream failures gracefully
- Logging: Structured logging for debugging

### Deployment
- Immutable infrastructure: Deploy new versions rather than updating in-place
- Health checks: Implement readiness and liveness probes
- Resource management: Set appropriate limits and requests
- Security scanning: Scan images for vulnerabilities

### Operations
- Monitoring: Track key metrics and set alerts
- Logging: Centralized log aggregation
- Tracing: Distributed request tracing
- Performance: Regular load testing

---

This documentation provides a comprehensive overview of the Todo Chatbot Kubernetes deployment. For specific operational tasks, refer to the individual component documentation and operational runbooks.