# Todo AI Chatbot Implementation Plan

## Technical Context

This plan implements the AI-powered Todo Chatbot as specified in the technical specifications. The system will utilize MCP (Model Context Protocol) agents to enable natural language task management while maintaining a stateless architecture with database-persisted state.

### System Overview
- **Frontend**: OpenAI ChatKit interface for natural language interaction
- **Backend**: FastAPI server with JWT authentication
- **AI Layer**: OpenAI agents using MCP tools for task management
- **MCP Server**: Tool server providing deterministic task operations
- **Database**: Neon PostgreSQL for data persistence
- **Authentication**: Better Auth integration

## Constitution Check

### Compliance Verification
- ✅ Stateless Server Architecture: All state persists in database, no in-memory retention
- ✅ MCP-Only Data Access: AI agents interact with tasks only via MCP tools
- ✅ Single Endpoint Interaction: Unified chat endpoint for all interactions
- ✅ Scalable Architecture: Horizontal scaling capability with session independence
- ✅ Authentication Boundary: JWT token validation at API boundary

### Gate Evaluations
- **Architecture Compliance**: PASSED - All system principles followed
- **Security Requirements**: PASSED - Authentication at API boundary maintained
- **Scalability Goals**: PASSED - Stateless design enables horizontal scaling

## Phase 0: Research & Discovery

### R0.1 MCP Server Architecture Research
**Decision**: Implement official MCP SDK with FastAPI integration
**Rationale**: Official SDK provides standard tool discovery and registration patterns
**Alternatives considered**: Custom protocol vs. MCP standard vs. direct API calls

### R0.2 OpenAI Agent Integration Patterns
**Decision**: Use OpenAI Assistant API with tool calling capability
**Rationale**: Native support for function calling and conversation context
**Alternatives considered**: Direct API calls vs. Assistant API vs. Custom agent framework

### R0.3 Conversation State Management
**Decision**: Reconstruct conversation history from database per request
**Rationale**: Maintains statelessness while providing context continuity
**Alternatives considered**: In-memory cache vs. database reconstruction vs. client-side storage

## Phase 1: Design & Contracts

### P1.1 Data Model Design

#### Task Entity
- **Fields**: id (PK), user_id (FK), title (string, not null), description (text), due_date (timestamp), priority (enum: low/medium/high), completed (boolean, default false), created_at (timestamp), updated_at (timestamp)
- **Relationships**: Belongs to User, linked to Conversation via messages
- **Validation**: Title required, priority enum constraint, user ownership validation

#### Conversation Entity
- **Fields**: id (PK), user_id (FK), title (string), created_at (timestamp), updated_at (timestamp)
- **Relationships**: Belongs to User, has many Messages
- **Validation**: User ownership, creation timestamp auto-set

#### Message Entity
- **Fields**: id (PK), conversation_id (FK), sender_type (enum: user/ai), content (text, not null), timestamp (timestamp), metadata (json)
- **Relationships**: Belongs to Conversation
- **Validation**: Content required, sender_type enum, conversation ownership

### P1.2 API Contract Design

#### Chat Endpoint
- **Path**: POST /api/chat
- **Authentication**: JWT Bearer token required
- **Input**: {message: string, conversation_id?: number}
- **Output**: {response: string, conversation_id: number, metadata: object}
- **Error Codes**: 401 (unauthorized), 400 (bad request), 500 (server error)

#### MCP Tool Contracts
- **add_task**: {title: string, description?: string, due_date?: string, priority?: string} → {success: boolean, task_id?: number, error?: string}
- **list_tasks**: {filter?: string, sort?: string, limit?: number} → {success: boolean, tasks: Array, error?: string}
- **complete_task**: {task_id: number} → {success: boolean, error?: string}
- **delete_task**: {task_id: number} → {success: boolean, error?: string}
- **update_task**: {task_id: number, updates: object} → {success: boolean, error?: string}

### P1.3 MCP Server Design
- **Responsibility**: Host and register task management tools
- **Integration**: Connect to FastAPI backend for database operations
- **Authentication**: Validate user permissions for each tool call
- **Discovery**: Publish tool schemas for AI agent consumption

## Phase 2: Implementation Architecture

### P2.1 Frontend Layer Responsibilities
- **Role**: Natural language interface using OpenAI ChatKit
- **Features**:
  - Real-time chat interface
  - Message history display
  - Typing indicators and loading states
  - Error handling and user feedback
- **Authentication**: JWT token management and renewal
- **Data Flow**: User input → API call → AI response → UI update

### P2.2 Backend Layer Responsibilities
- **Role**: API gateway and authentication enforcement
- **Features**:
  - JWT token validation middleware
  - Conversation history reconstruction
  - MCP server connection management
  - Database operation coordination
- **Endpoints**:
  - POST /api/chat: Process user messages and return AI responses
  - GET /api/conversations: List user conversations
  - GET /api/tasks: List user tasks (fallback API)
- **Security**: Token validation, user isolation, rate limiting

### P2.3 AI Agent Layer Responsibilities
- **Role**: Natural language processing and tool orchestration
- **Features**:
  - Interpret user intent from natural language
  - Select appropriate MCP tools for task operations
  - Maintain conversation context across exchanges
  - Generate human-friendly responses
- **Integration**: Connect to MCP server for tool discovery and execution
- **Context**: Reconstruct conversation history for context awareness

### P2.4 MCP Server Layer Responsibilities
- **Role**: Expose deterministic task management tools
- **Features**:
  - Register add_task, list_tasks, complete_task, delete_task, update_task tools
  - Validate user permissions for each operation
  - Connect to database for persistence
  - Provide tool schemas for AI agent discovery
- **Authentication**: Verify user authorization for each tool call
- **Safety**: Ensure tools are deterministic with no side effects

### P2.5 Database Layer Responsibilities
- **Role**: Persistent storage for all application data
- **Entities**:
  - Users: Authentication and authorization data
  - Tasks: User task information with metadata
  - Conversations: Chat session metadata
  - Messages: Individual conversation messages
- **Relationships**: Foreign key constraints ensuring data integrity
- **Performance**: Indexes for efficient querying by user and conversation

## Phase 3: Stateless Chat Implementation

### P3.1 State Reconstruction Pattern
- **Process**: On each request, fetch conversation history from database
- **Implementation**: Query messages ordered by timestamp for context
- **Caching**: Optional short-term caching for performance optimization
- **Validation**: Ensure all required context is available before AI processing

### P3.2 Session Independence Design
- **Principle**: Each request contains all necessary context
- **Implementation**: Pass conversation ID and reconstruct state as needed
- **Scalability**: No server affinity required for requests
- **Reliability**: Server restarts don't affect ongoing conversations

### P3.3 Context Preservation Mechanism
- **Method**: Store full conversation history in database
- **Access**: Retrieve latest N messages for context window
- **Management**: Automatic pruning of old messages to maintain performance
- **Consistency**: Transactional updates to maintain message ordering

## Phase 4: Agent-MCP Integration

### P4.1 Tool Discovery Process
- **Mechanism**: AI agent connects to MCP server to discover available tools
- **Schema**: Tools publish JSON Schema definitions for parameters
- **Registration**: MCP server maintains registry of available tools
- **Validation**: Verify tool contracts match specifications

### P4.2 Tool Invocation Flow
- **Step 1**: AI agent determines appropriate tool based on user intent
- **Step 2**: Agent prepares tool parameters from natural language
- **Step 3**: Agent calls MCP tool with validated parameters
- **Step 4**: MCP server validates user authorization
- **Step 5**: MCP server executes database operation
- **Step 6**: Results returned to AI agent for response generation

### P4.3 Error Handling in Tool Chain
- **Agent Level**: Handle tool invocation failures gracefully
- **MCP Level**: Validate inputs and permissions before execution
- **Database Level**: Handle transaction failures and rollbacks
- **User Level**: Provide meaningful error messages when operations fail

## Phase 5: Data Persistence Flow

### P5.1 Task Creation Flow
- **Trigger**: User requests to add a task
- **Agent Processing**: Parse natural language into task parameters
- **MCP Call**: add_task tool with title, description, due_date, priority
- **Validation**: MCP server validates user permissions
- **Persistence**: Create Task record in database
- **Response**: Return task_id to AI agent for confirmation

### P5.2 Task Retrieval Flow
- **Trigger**: User requests to view tasks
- **Agent Processing**: Determine appropriate filter/sort parameters
- **MCP Call**: list_tasks tool with optional filters
- **Validation**: MCP server validates user permissions
- **Query**: Fetch user's tasks from database
- **Response**: Return task array to AI agent for formatting

### P5.3 Task Modification Flow
- **Trigger**: User requests to update/complete/delete task
- **Agent Processing**: Identify task and operation from natural language
- **MCP Call**: appropriate tool (complete_task, update_task, delete_task)
- **Validation**: MCP server validates user permissions and task existence
- **Operation**: Update/delete task record in database
- **Response**: Return success/failure to AI agent

## Phase 6: Authentication Integration

### P6.1 Token Validation Pipeline
- **Layer**: API Gateway (FastAPI) handles initial validation
- **Process**: Extract JWT from Authorization header
- **Verification**: Validate signature, expiration, and user existence
- **Context**: Attach user identity to request context
- **Propagation**: Pass user ID to downstream services

### P6.2 User Isolation Enforcement
- **Database Level**: All queries filtered by user_id
- **MCP Level**: Each tool validates user ownership before operations
- **Application Level**: Ensure cross-user data access is prevented
- **Audit Trail**: Log user actions for security monitoring

### P6.3 Permission Validation Chain
- **API Layer**: Validate token before processing request
- **MCP Layer**: Validate user can access requested resource
- **Database Layer**: Enforce foreign key constraints
- **Service Layer**: Verify business logic permissions

## Phase 7: Deployment Architecture

### P7.1 Container Orchestration
- **Services**: Separate containers for frontend, backend, MCP server
- **Scaling**: Independent scaling based on resource requirements
- **Networking**: Internal service discovery and communication
- **Health Checks**: Monitor service availability and performance

### P7.2 Database Connection Management
- **Pooling**: Connection pooling for efficient resource utilization
- **Security**: Encrypted connections to database
- **Failover**: Configure read replicas for high availability
- **Monitoring**: Track query performance and connection health

### P7.3 Environment Configuration
- **Secrets**: Secure management of API keys and database credentials
- **Configuration**: Environment-specific settings for each deployment tier
- **Rollback**: Ability to quickly revert deployments if issues arise
- **Monitoring**: Real-time health and performance dashboards