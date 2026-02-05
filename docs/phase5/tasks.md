# Phase V: Task Breakdown

## Task 1: Setup Dapr on Kubernetes
**Description**: Install Dapr on the Kubernetes cluster
**Files to modify/create**: None (cluster setup)
**Commands to run**:
- `dapr init -k`
- `kubectl wait --for=condition=ready pod -l app=dapr-operator -n dapr-system`
**Success criteria**: Dapr control plane pods running and ready

## Task 2: Deploy Kafka/Redpanda to Kubernetes
**Description**: Deploy Kafka/Redpanda messaging infrastructure to the cluster
**Files to create**: k8s/kafka/kafka-cluster.yaml
**Commands to run**:
- `kubectl create namespace kafka`
- `kubectl apply -f k8s/kafka/kafka-cluster.yaml`
**Success criteria**: Kafka/Zookeeper pods running and ready

## Task 3: Configure Dapr Components
**Description**: Create Dapr component configurations for pubsub, state, and secrets
**Files to create**:
- k8s/dapr/components/pubsub-kafka.yaml
- k8s/dapr/components/state-postgres.yaml
- k8s/dapr/components/secrets-k8s.yaml
**Commands to run**: `kubectl apply -f k8s/dapr/components/`
**Success criteria**: Dapr components registered and accessible

## Task 4: Update Backend API to Publish Events
**Description**: Modify the existing FastAPI backend to publish events via Dapr
**Files to modify**:
- backend/main.py
- backend/services/task_service.py
- backend/api/task_endpoint.py
**Files to create**: backend/dapr_client.py
**Commands to run**: `docker build -t todo-backend:phase5 .` in backend/
**Success criteria**: Backend successfully publishes events to Dapr pubsub

## Task 5: Create Notification Service
**Description**: Implement notification service that consumes reminder events
**Files to create**:
- backend/services/notification_service.py
- backend/api/notification_endpoint.py
- backend/notification_consumer.py
**Commands to run**: `docker build -t todo-notification:phase5 .` in backend/
**Success criteria**: Service consumes reminder events and sends notifications

## Task 6: Create Recurring Task Service
**Description**: Implement recurring task service that creates new tasks from events
**Files to create**:
- backend/services/recurring_task_service.py
- backend/recurring_task_consumer.py
**Commands to run**: `docker build -t todo-recurring:phase5 .` in backend/
**Success criteria**: Service consumes task completion events and creates new recurring tasks

## Task 7: Create Audit Service
**Description**: Implement audit logging service that maintains event history
**Files to create**:
- backend/services/audit_service.py
- backend/audit_consumer.py
**Commands to run**: `docker build -t todo-audit:phase5 .` in backend/
**Success criteria**: Service consumes all task events and maintains audit logs

## Task 8: Update Frontend for Event-Driven Flows
**Description**: Update frontend to handle event-driven task operations
**Files to modify**:
- frontend/src/lib/api.ts
- frontend/src/components/TaskForm/TaskForm.tsx
- frontend/src/app/dashboard/page.tsx
**Commands to run**: `docker build -t todo-frontend:phase5 .` in frontend/
**Success criteria**: Frontend works with updated backend event flows

## Task 9: Create Kubernetes Manifests
**Description**: Create deployment and service manifests for all services
**Files to create**:
- k8s/deployments/frontend-deployment.yaml
- k8s/deployments/backend-deployment.yaml
- k8s/deployments/notification-deployment.yaml
- k8s/deployments/recurring-deployment.yaml
- k8s/deployments/audit-deployment.yaml
- k8s/services/frontend-service.yaml
- k8s/services/backend-service.yaml
- k8s/services/notification-service.yaml
- k8s/services/recurring-service.yaml
- k8s/services/audit-service.yaml
- k8s/ingress.yaml
**Commands to run**: `kubectl apply -f k8s/`
**Success criteria**: All deployments and services created successfully

## Task 10: Configure Environment and Secrets
**Description**: Set up Kubernetes secrets and configmaps for the application
**Files to create**:
- k8s/configmaps/app-config.yaml
- k8s/secrets/app-secrets.yaml
**Commands to run**: `kubectl apply -f k8s/configmaps/` and `kubectl apply -f k8s/secrets/`
**Success criteria**: ConfigMaps and secrets created and accessible

## Task 11: Create Helm Charts
**Description**: Package the application into Helm charts for easy deployment
**Files to create**:
- helm/todo-app/Chart.yaml
- helm/todo-app/values.yaml
- helm/todo-app/templates/_helpers.tpl
- helm/todo-app/templates/deployment.yaml
- helm/todo-app/templates/service.yaml
- helm/todo-app/templates/ingress.yaml
- helm/todo-app/templates/configmap.yaml
- helm/todo-app/templates/dapr-components.yaml
**Commands to run**: `helm install todo-app helm/todo-app/`
**Success criteria**: Helm chart installs successfully with all resources

## Task 12: Local Minikube Deployment
**Description**: Deploy the complete system to a local Minikube cluster
**Files to modify/create**: deploy_phase5.sh
**Commands to run**: `./deploy_phase5.sh`
**Success criteria**: All services running and accessible locally

## Task 13: Integration Testing
**Description**: Test the complete event-driven workflow
**Files to create**: tests/integration_test_phase5.py
**Commands to run**: `python tests/integration_test_phase5.py`
**Success criteria**: All event flows work as expected

## Task 14: Cloud Preparation
**Description**: Prepare configurations for cloud deployment
**Files to modify**: k8s/cloud-values.yaml, docs/deployment-guide.md
**Commands to run**: N/A (documentation)
**Success criteria**: Documentation ready for cloud deployment