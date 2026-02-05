# Phase V: Advanced Cloud Deployment Constitution

## Purpose
This constitution establishes the rules and constraints for implementing advanced cloud deployment with event-driven architecture using Kafka and Dapr for the Todo Full-Stack Web Application.

## Architectural Principles
- **Event-Driven Architecture**: All task operations must be published as events to Kafka via Dapr Pub/Sub
- **Microservices Separation**: Different concerns (notifications, recurring tasks, audit) handled by separate services
- **Dapr Abstraction**: All infrastructure interactions (pub/sub, state, secrets) must go through Dapr
- **Cloud-Native**: Solutions must work on both local Minikube and cloud Kubernetes (AKS/GKE/OKE)
- **Scalability**: Event-driven design enables horizontal scaling of services independently

## Non-Goals
- Full monorepo restructuring
- Complete rewrite of existing functionality
- Complex event sourcing patterns
- Advanced stream processing beyond basic pub/sub
- UI overhaul beyond necessary integration points

## Constraints
- All Kafka interactions must use Dapr Pub/Sub building block
- State management must use Dapr State building block where applicable
- Secrets must be managed through Dapr Secret building block
- Service-to-service communication must use Dapr Service Invocation
- Job scheduling for reminders must use Dapr Jobs API
- Docker builds must continue to work for all services
- Existing functionality must remain intact

## Definition of DONE
- [ ] Event-driven architecture implemented with Dapr + Kafka
- [ ] Recurring tasks feature working via event consumption
- [ ] Due dates & reminders working via event consumption
- [ ] Notification service consuming reminder events
- [ ] Audit logging service consuming task events
- [ ] Successful deployment to Minikube
- [ ] Cloud-ready Kubernetes manifests created
- [ ] All Docker images build successfully
- [ ] Dapr components properly configured
- [ ] Service-to-service communication via Dapr