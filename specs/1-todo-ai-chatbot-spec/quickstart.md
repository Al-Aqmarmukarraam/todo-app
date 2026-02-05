# Todo AI Chatbot Quickstart Guide

## Development Setup

### Prerequisites
- Node.js 18+ for frontend development
- Python 3.9+ for backend and MCP server
- PostgreSQL or Neon account for database
- OpenAI API key for AI services
- Better Auth credentials for authentication

### Environment Variables
Create `.env` files for each service:

**Backend (.env)**
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@host:port/database
NEON_DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_auth_secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**MCP Server (.env)**
```
DATABASE_URL=postgresql://user:password@host:port/database
NEON_DATABASE_URL=your_neon_database_url
```

## Architecture Overview

### Service Components
1. **Frontend**: Next.js application with OpenAI ChatKit
2. **Backend**: FastAPI server handling chat API and authentication
3. **MCP Server**: Tool server providing task management tools
4. **Database**: Neon PostgreSQL storing tasks, conversations, messages
5. **AI Layer**: OpenAI agents connecting to MCP tools

### Data Flow
```
User Input → Frontend → Backend (JWT Auth) → AI Agent → MCP Tools → Database
```

## Running Locally

### 1. Start Database
```bash
# Using Neon or local PostgreSQL
# Ensure database schema is initialized
```

### 2. Start MCP Server
```bash
cd mcp-server
pip install -r requirements.txt
python main.py
```

### 3. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Key Endpoints

### Chat API
- `POST /api/chat` - Main chat endpoint for AI interactions
- Authentication: Bearer token required
- Request: `{message: string, conversation_id?: number}`
- Response: `{response: string, conversation_id: number, metadata: object}`

### Task Operations
- MCP tools handle all task operations (add_task, list_tasks, etc.)
- Tools accessed through AI agent via MCP server
- No direct API endpoints for task operations

## MCP Tool Integration

### Available Tools
- `add_task`: Create new tasks
- `list_tasks`: Retrieve user tasks
- `complete_task`: Mark tasks as completed
- `delete_task`: Remove tasks
- `update_task`: Modify task properties

### Tool Usage Flow
1. User sends natural language request
2. AI agent interprets intent
3. AI agent selects appropriate MCP tool
4. MCP tool executes database operation
5. AI agent formats response for user

## Authentication Flow

### JWT Token Handling
1. User authenticates via Better Auth
2. JWT token issued and stored client-side
3. Token sent with each chat request
4. Backend validates token before processing
5. User context passed to MCP tools for authorization

### User Isolation
- All database queries filtered by user_id
- MCP tools validate user ownership before operations
- Cross-user data access prevented at multiple layers

## Development Guidelines

### Adding New MCP Tools
1. Define tool schema in MCP server
2. Implement database operations
3. Add authentication validation
4. Test tool integration with AI agent
5. Update documentation

### Error Handling
- Handle authentication failures gracefully
- Provide meaningful error messages to users
- Log errors for debugging without exposing sensitive data
- Maintain conversation context during errors

### State Management
- Maintain stateless architecture
- Reconstruct conversation history from database
- Ensure session independence across requests
- Handle context preservation for multi-turn conversations