# Phase V: Advanced Cloud Deployment Specification

## System Overview
This specification describes the implementation of an event-driven architecture for the Todo application using Kafka as the message broker and Dapr for infrastructure abstraction. The system separates concerns into multiple microservices that communicate through events published to Kafka topics.

## Event-Driven Architecture Explanation
The system implements a producer-consumer pattern where:
- The Todo/Chat API acts as the primary event producer
- Specialized services act as consumers for specific business logic
- All communication happens through Kafka topics managed by Dapr
- Events are persisted for audit trails and replay capabilities

## Architecture Diagram
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERNETES CLUSTER                                       │
│                                                                                       │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────────────┐ │
│  │    Frontend Pod     │   │    Backend Pod      │   │     Consumer Pods           │ │
│  │ ┌───────┐ ┌───────┐ │   │ ┌───────┐ ┌───────┐ │   │ ┌─────────┐ ┌──────────┐  │ │
│  │ │ Next  │ │ Dapr  │ │   │ │FastAPI│ │ Dapr  │ │   │ │Notif    │ │Recurring │  │ │
│  │ │  App  │◀┼▶Sidecar│ │   │ │+ MCP  │◀┼▶Sidecar│ │   │ │Service  │ │Task      │  │ │
│  │ └───────┘ └───────┘ │   │ │+Events│ └───────┘ │   │ │         │ │Service   │  │ │
│  └──────────┬──────────┘   └──────────┬──────────┘   │ └─────────┘ └──────────┘  │ │
│             │                         │              │ ┌─────────┐ ┌──────────┐  │ │
│             │                         │              │ │AuditLog │ │WebSocket │  │ │
│             │                         │              │ │Service  │ │Sync      │  │ │
│             │                         │              │ │         │ │Service   │  │ │
│             │                         │              │ └─────────┘ └──────────┘  │ │
│             │                         │              └─────────────────────────────┘ │
│             │                         │                                              │
│             └─────────────────────────┼──────────────────────────────────────────────┘
│                                       │
│                          ┌────────────▼────────────┐
│                          │    DAPR COMPONENTS      │
│                          │  ┌──────────────────┐   │
│                          │  │ pubsub.kafka     │───┼────▶ Kafka Cluster
│                          │  ├──────────────────┤   │
│                          │  │ state.postgresql │───┼────▶ Neon DB
│                          │  ├──────────────────┤   │
│                          │  │ scheduler        │   │  (Dapr Jobs API)
│                          │  ├──────────────────┤   │
│                          │  │ secretstores.k8s │   │  (K8s Secrets)
│                          │  └──────────────────┘   │
│                          └─────────────────────────┘
```

## Service Responsibilities
### Todo/Chat API (Producer)
- Primary entry point for all task operations
- Publishes events to Kafka via Dapr Pub/Sub
- Maintains core business logic
- Validates input and manages user sessions

### Notification Service (Consumer)
- Consumes "reminders" topic
- Sends notifications to users (email/push)
- Handles due date reminders
- Manages notification delivery

### Recurring Task Service (Consumer)
- Consumes "task-events" topic
- Creates new task instances when recurring tasks are completed
- Manages recurrence patterns
- Schedules future occurrences

### Audit Log Service (Consumer)
- Consumes "task-events" topic
- Maintains complete history of all operations
- Provides audit trail for compliance
- Stores event metadata

### WebSocket Sync Service (Consumer - Optional)
- Consumes "task-updates" topic
- Broadcasts changes to connected clients
- Enables real-time synchronization
- Maintains WebSocket connections

## Kafka Topics and Event Schemas

### Topic: task-events
**Producer**: Todo/Chat API
**Consumers**: Recurring Task Service, Audit Log Service

**Schema**:
```json
{
  "event_type": "string",
  "task_id": "integer",
  "task_data": "object",
  "user_id": "string",
  "timestamp": "datetime"
}
```

### Topic: reminders
**Producer**: Todo/Chat API (when due dates set)
**Consumers**: Notification Service

**Schema**:
```json
{
  "task_id": "integer",
  "title": "string",
  "due_at": "datetime",
  "remind_at": "datetime",
  "user_id": "string"
}
```

### Topic: task-updates
**Producer**: Todo/Chat API (for real-time sync)
**Consumers**: WebSocket Sync Service

**Schema**:
```json
{
  "operation": "string",
  "task_id": "integer",
  "task_data": "object",
  "user_id": "string",
  "timestamp": "datetime"
}
```

## Dapr Components List
### pubsub.kafka
- Type: pubsub.kafka
- Purpose: Event streaming for all services
- Topics: task-events, reminders, task-updates

### state.postgresql
- Type: state.postgresql
- Purpose: Conversation state and caching
- Backend: Neon Postgres

### service invocation
- Built-in Dapr feature
- Purpose: Service-to-service communication
- Security: mTLS enabled

### jobs API
- Purpose: Scheduled reminder triggers
- Alternative to cron bindings for precise timing

### secretstores.kubernetes
- Type: secretstores.kubernetes
- Purpose: Secure credential management
- Backend: Kubernetes secrets

## Deployment Expectations
### Local (Minikube)
- All services deployed with Dapr sidecars
- Kafka deployed in-cluster (Strimzi)
- Dapr components configured for local use
- End-to-end functionality verified

### Cloud (AKS/GKE/OKE)
- Same manifests work across cloud providers
- Managed Kafka (Confluent/Redpanda Cloud) or in-cluster
- Production-grade configurations
- Scalable deployments

## Local vs Cloud Differences
| Aspect | Local | Cloud |
|--------|-------|-------|
| Kafka | Strimzi in-cluster | Managed service or in-cluster |
| Secrets | Kubernetes secrets | Cloud KMS integration |
| Scaling | Manual | Auto-scaling enabled |
| Storage | Ephemeral | Persistent volumes |
| Monitoring | Basic | Full stackdriver/prometheus |

## Success Criteria
- [ ] All services communicate via Dapr building blocks
- [ ] Event-driven architecture functional
- [ ] Recurring tasks work through event consumption
- [ ] Reminders delivered via notification service
- [ ] Audit trail maintained for all operations
- [ ] System deployable to Minikube
- [ ] Cloud-ready manifests created