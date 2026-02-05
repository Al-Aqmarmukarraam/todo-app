# Todo AI Chatbot - Phase III

## Overview
This project implements an AI-powered Todo Chatbot that allows users to manage tasks through natural language interactions. The system uses MCP (Model Context Protocol) agents to enable intelligent task management operations while maintaining a stateless architecture with database-persisted state.

## Architecture
- **Frontend**: Next.js 16+ application with OpenAI ChatKit-like interface
- **Backend**: FastAPI server with JWT authentication and OpenAI Agents SDK integration
- **AI Layer**: OpenAI agents using MCP tools for deterministic task management
- **MCP Server**: Tool server providing deterministic task operations
- **Database**: Neon PostgreSQL for data persistence (Tasks, Conversations, Messages)
- **Authentication**: Better Auth integration

## Features
- Natural language task management (create, list, update, complete, delete tasks)
- Stateful conversation context across multiple exchanges
- Secure JWT-based authentication
- Responsive chat interface with real-time messaging
- MCP-based tool integration for deterministic task operations
- Conversation persistence in database
- Multi-user isolation with proper authorization

## Tech Stack
- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS, ChatKit UI
- **Backend**: FastAPI, SQLModel, PostgreSQL
- **AI Integration**: OpenAI Agents SDK, MCP Protocol
- **Authentication**: Better Auth compatibility
- **Database**: Neon PostgreSQL

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL or Neon account
- OpenAI API key

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env.local` file with environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the development server: `npm run dev`

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
   SECRET_KEY=your-super-secret-key
   OPENAI_API_KEY=your-openai-api-key
   ```
4. Start the server: `uvicorn main:app --reload`

### MCP Server Setup
1. Navigate to the MCP server directory: `cd mcp-server`
2. Install dependencies: `pip install -r requirements.txt`
3. Start the MCP server: `python mcp_server.py`

### Database Setup
1. Ensure PostgreSQL is running
2. The application will automatically create required tables on startup
3. For Neon, update the DATABASE_URL in the backend `.env` file

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
OPENAI_API_KEY=your-openai-api-key
MCP_SERVER_URL=http://localhost:8001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

### Chat API
- `POST /api/chat` - Main chat endpoint for AI interactions
  - Requires JWT Bearer token
  - Request: `{message: string, conversation_id?: number}`
  - Response: `{response: string, conversation_id: number, metadata: object}`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

## MCP Tools

### Available Tools
- `add_task`: Create new tasks with title, description, due date, and priority
- `list_tasks`: Retrieve user's tasks with optional filtering and sorting
- `complete_task`: Mark tasks as completed
- `delete_task`: Remove tasks from the system
- `update_task`: Modify task properties

## Development

### Running the Full Stack
1. Start the MCP server: `cd mcp-server && python mcp_server.py`
2. Start the backend: `cd backend && uvicorn main:app --reload`
3. Start the frontend: `cd frontend && npm run dev`

### Database Migrations
The application uses SQLModel for database management. Tables are created automatically on startup.

## Security Considerations
- All API endpoints require JWT authentication
- User data is isolated by user ID
- MCP tools validate user permissions before operations
- Input sanitization is implemented for all user inputs
- Rate limiting is applied to prevent abuse

## Error Handling
- Comprehensive error handling for all API endpoints
- Graceful degradation when MCP server is unavailable
- User-friendly error messages for all failure scenarios
- Structured logging for debugging purposes

## Testing
- Unit tests for core services
- Integration tests for API endpoints
- End-to-end tests for user flows

## Deployment
The application is designed for containerized deployment with separate services for frontend, backend, and MCP server. Each component can scale independently based on demand.