# REST API Endpoints Specification

## Base API URL
- Base URL: `/api`
- All endpoints prefixed with `/api`
- All endpoints require JWT authentication in Authorization header

## JWT Authentication Requirement
- All API endpoints require valid JWT token in Authorization header
- Format: `Authorization: Bearer <jwt_token>`
- Invalid/expired tokens return 401 Unauthorized
- Unauthenticated requests return appropriate error message

## Endpoint Definitions

### GET /api/{user_id}/tasks
- **Purpose**: Retrieve all tasks for a specific user
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token (validation required)
  - Optional query params: `status` (filter by completion status)
- **Response**: Array of task objects
- **Success Response**: 200 OK with array of task objects
- **Error Responses**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### POST /api/{user_id}/tasks
- **Purpose**: Create a new task for a user
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token (validation required)
- **Request Body**: Task object with required fields
- **Response**: Created task object with assigned ID
- **Success Response**: 201 Created with new task object
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 403 Forbidden

### GET /api/{user_id}/tasks/{id}
- **Purpose**: Retrieve a specific task for a user
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token
  - `id` (path): Task identifier
- **Response**: Single task object
- **Success Response**: 200 OK with task object
- **Error Responses**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### PUT /api/{user_id}/tasks/{id}
- **Purpose**: Update an existing task for a user
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token
  - `id` (path): Task identifier
- **Request Body**: Complete task object with updated fields
- **Response**: Updated task object
- **Success Response**: 200 OK with updated task object
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### DELETE /api/{user_id}/tasks/{id}
- **Purpose**: Delete a specific task for a user
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token
  - `id` (path): Task identifier
- **Response**: Confirmation of deletion
- **Success Response**: 204 No Content
- **Error Responses**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### PATCH /api/{user_id}/tasks/{id}/complete
- **Purpose**: Toggle completion status of a task
- **Authentication**: Required
- **Parameters**:
  - `user_id` (path): User identifier from JWT token
  - `id` (path): Task identifier
- **Request Body**: Object with completion status (true/false)
- **Response**: Updated task object with new completion status
- **Success Response**: 200 OK with updated task object
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

## Request/Response Schemas (High-Level)

### Task Object
- `id`: Unique identifier (string or number)
- `title`: Task title (string, required)
- `description`: Task description (string, optional)
- `completed`: Completion status (boolean)
- `created_at`: Creation timestamp (ISO 8601 string)
- `updated_at`: Last update timestamp (ISO 8601 string)
- `user_id`: Associated user identifier (string or number)

### Authentication Error Response
- `error`: Error message (string)
- `code`: Error code (string)
- `timestamp`: Error occurrence time (ISO 8601 string)

### Validation Error Response
- `error`: Validation error message (string)
- `details`: Field-specific error details (object)
- `code`: Validation error code (string)