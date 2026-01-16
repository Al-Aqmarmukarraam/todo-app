# Quickstart Guide: Todo Full-Stack Web Application

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.9+
- Access to Neon PostgreSQL database

### Initial Setup
1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Copy environment template: `cp .env.example .env.local`
5. Configure environment variables with your Neon PostgreSQL credentials
6. Run database migrations: `python -m db.migrate`

### Running the Application
1. Start the backend: `uvicorn main:app --reload`
2. In another terminal, start the frontend: `npm run dev`
3. Visit http://localhost:3000 to access the application

## Key Architecture Points

### Folder Structure
- `/app` - Next.js App Router pages and layouts
- `/api` - API route handlers
- `/lib` - Shared utilities and services
- `/components` - Reusable React components
- `/db` - Database models and connection utilities
- `/auth` - Authentication middleware and utilities

### Authentication Flow
1. Users register/login via the auth forms
2. JWT tokens are issued upon successful authentication
3. Tokens are stored securely and sent with API requests
4. API routes verify token validity before processing requests

### Data Flow
1. User interacts with frontend components
2. Frontend calls centralized API client
3. API client sends requests to backend with authentication
4. Backend validates user permissions and processes request
5. Database operations are performed with user isolation
6. Response is returned to frontend