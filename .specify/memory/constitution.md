<!-- Sync Impact Report:
Version change: 2.0.0 -> 3.0.0
Modified principles: Project Vision, Technical Constraints, Evaluation Criteria, Phase Definitions
Added sections: MCP Server Design, AI Agent Integration, System Architecture Principles
Removed sections: None
Templates requiring updates: ⚠ pending review of all templates
Follow-up TODOs: None
-->

# Todo AI Chatbot Constitution

## Version Information
- **Constitution Version**: 3.0.0
- **Ratification Date**: 2025-12-28
- **Last Amended Date**: 2026-01-15

## 1. Project Vision

The Todo AI Chatbot project embodies the transformation from a multi-user web application to an AI-powered natural language task management system. This initiative demonstrates the evolution of software development practices, emphasizing the importance of AI agent integration, stateless architecture, and MCP-based tool orchestration. Phase I (CLI app) established foundational principles. Phase II delivered a full-stack web application with user authentication. Phase III transforms this into an AI-powered chatbot using MCP agents for natural language task management. Phase IV will focus on advanced AI features and scaling.

## 2. Development Philosophy

The project follows an AI-first, spec-driven, agentic development approach with MCP server architecture. Manual boilerplate coding by the student is prohibited, ensuring focus on architectural and design decisions rather than implementation minutiae. The student acts as Principal Product Architect and reviewer, making critical decisions while leveraging AI as an implementation agent. All development follows the principle of human-in-the-loop oversight with automated execution through MCP tools.

## 3. Agentic Workflow Rules

Development follows the strict sequence: Spec → Plan → Task Breakdown → Implementation. Every step requires explicit human approval before proceeding to the next phase. Iterative refinement is encouraged and must be documented through Prompt History Records (PHRs). Each architectural decision must be validated and approved before implementation begins. No implementation work may commence without a completed and approved specification and plan.

## 4. Technical Constraints

The project operates under specific technical constraints to ensure focus on core principles:

### Frontend Stack
- OpenAI ChatKit
- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- Client Components only for interactive elements

### Backend Stack
- FastAPI (Python)
- SQLModel
- Neon Serverless PostgreSQL
- Better Auth for authentication
- OpenAI Agents SDK
- Official MCP SDK
- Single chat endpoint for all interactions

### System Architecture Constraints
- Server must be fully stateless
- All state (tasks, conversations, messages) must persist in database
- AI agents MUST interact with tasks only via MCP tools
- No direct DB access from agent logic
- MCP tools must be deterministic and side-effect safe
- Authentication must be enforced at API boundary
- Conversation history must be reconstructed per request

### General Constraints
- No manual code editing by user
- Claude Code is the sole implementer
- All features must be spec-driven
- Data persistence through Neon PostgreSQL
- Authentication via JWT tokens

## 5. System Architecture Principles

### MCP-Only Data Access Principle
- **Rule**: AI agents MUST interact with tasks only via MCP tools
- **Requirements**:
  - No direct database access from agent logic
  - All data operations must go through MCP server tools
  - MCP tools must be deterministic and side-effect safe
- **Rationale**: Ensures proper separation of concerns and auditability

### Stateless Server Architecture Principle
- **Rule**: Server must be fully stateless with all state persisted in database
- **Requirements**:
  - All tasks, conversations, and messages must be stored in Neon PostgreSQL
  - No in-memory state retention between requests
  - Server restarts must not lose any user data
- **Rationale**: Enables horizontal scaling and fault tolerance

### Single Endpoint Interaction Principle
- **Rule**: Single chat endpoint for all AI interactions
- **Requirements**:
  - Unified chat endpoint handles all user requests
  - Conversation history reconstructed per request from database
  - Consistent interface regardless of underlying complexity
- **Rationale**: Simplifies frontend integration and maintains clean API boundary

### Scalable Architecture Principle
- **Rule**: System must be scalable and restart-safe
- **Requirements**:
  - Horizontal scaling capability without data loss
  - Graceful handling of server restarts
  - Session independence across instances
- **Rationale**: Supports growth and operational reliability

### Authentication Boundary Principle
- **Rule**: Authentication enforcement at API boundary
- **Requirements**:
  - JWT token validation at chat endpoint
  - User context extraction from tokens
  - Permission validation before processing
- **Rationale**: Secures all AI interactions with proper user isolation

## 6. Code Quality Standards

Code must meet the following standards:
- Clean, modular, readable code with clear separation of concerns
- Meaningful naming conventions that reflect purpose and function
- Proper error handling for expected failure cases
- Proper documentation for public interfaces
- Adherence to language best practices and style guidelines (PEP 8 for Python, TypeScript standards)
- Testable architecture with clear component boundaries
- Consistent folder structure and file naming conventions
- MCP tool functions must be deterministic and side-effect free

## 7. Documentation Requirements

The project must maintain comprehensive documentation:
- Constitution file at repository root defining governance principles
- specs/ directory containing versioned specification files for each feature
- README.md with setup and execution instructions
- CLAUDE.md files in root, frontend/, backend/, and mcp-server/ directories
- All architectural decisions must be documented in ADRs when significant
- MCP tool documentation and usage guides

## 8. Evaluation Criteria

Project success is measured by:
- Strict adherence to agentic workflow with human approval at each stage
- Quality and completeness of specifications and planning documents
- Clarity and documentation of architectural decisions
- Functional correctness of the AI chatbot system
- Proper use of AI assistance without bypassing human oversight
- Compliance with all technical constraints and quality standards
- Successful implementation of MCP-based task management
- Proper integration between AI agents and task persistence
- Stateless server architecture implementation
- MCP tool design and functionality

## 9. Phase Definitions

- **Phase I**: CLI-based Todo app (completed)
- **Phase II**: Multi-user full-stack web application (completed)
- **Phase III**: AI-powered Todo Chatbot with MCP agents (current phase)
- **Phase IV**: Advanced AI features and scaling (future)

## Governance

This constitution may only be amended through explicit human approval following a formal change proposal process. Versioning follows semantic versioning principles where major changes represent fundamental shifts in approach, minor changes add new principles or constraints, and patch changes address clarifications or corrections. All team members must acknowledge and comply with this constitution before participating in development activities.

### Security Considerations
- User data isolation and privacy protection
- Secure token handling and validation
- Input sanitization for AI interactions
- Rate limiting and abuse prevention
- MCP server security and authentication