# Todo AI Chatbot MCP Server Specification

## Overview
The Model Context Protocol (MCP) Server provides deterministic tools for the Todo AI Chatbot agent. The server exposes RESTful endpoints that map to specific task management operations, enabling the AI agent to perform precise actions based on user requests.

## Architecture
- **Protocol**: REST API over HTTP
- **Server**: FastAPI-based MCP server
- **Integration**: Called by AI agent via tool calls
- **Data Layer**: Direct integration with SQLModel/PostgreSQL
- **Security**: User ID validation for authorization

## MCP Tools Specification

### 1. add_task
- **Endpoint**: `POST /tools/add_task`
- **Purpose**: Create a new task for a user
- **Parameters**:
  - `user_id` (string, required): ID of the user creating the task
  - `title` (string, required): Title of the task
  - `description` (string, optional): Description of the task
- **Response**:
  - Success: `{ "success": true, "data": { task_object } }`
  - Error: `{ "success": false, "error": "error_message" }`
- **Behavior**: Creates a new task record in the database with default values for priority and completion status

### 2. list_tasks
- **Endpoint**: `POST /tools/list_tasks`
- **Purpose**: Retrieve tasks for a user with optional filtering
- **Parameters**:
  - `user_id` (string, required): ID of the user requesting tasks
  - `status` (string, required): Filter by status ("all", "pending", "completed")
- **Response**:
  - Success: `{ "success": true, "data": [task_array] }`
  - Error: `{ "success": false, "error": "error_message" }`
- **Behavior**: Returns array of task objects filtered by status for the specified user

### 3. complete_task
- **Endpoint**: `POST /tools/complete_task`
- **Purpose**: Mark a task as completed
- **Parameters**:
  - `user_id` (string, required): ID of the user owning the task
  - `task_id` (integer, required): ID of the task to complete
- **Response**:
  - Success: `{ "success": true, "data": { updated_task_object } }`
  - Error: `{ "success": false, "error": "error_message" }`
- **Behavior**: Updates the completed field of the specified task to true

### 4. delete_task
- **Endpoint**: `POST /tools/delete_task`
- **Purpose**: Remove a task from the user's list
- **Parameters**:
  - `user_id` (string, required): ID of the user owning the task
  - `task_id` (integer, required): ID of the task to delete
- **Response**:
  - Success: `{ "success": true }`
  - Error: `{ "success": false, "error": "error_message" }`
- **Behavior**: Removes the specified task from the database

### 5. update_task
- **Endpoint**: `POST /tools/update_task`
- **Purpose**: Modify properties of an existing task
- **Parameters**:
  - `user_id` (string, required): ID of the user owning the task
  - `task_id` (integer, required): ID of the task to update
  - `title` (string, optional): New title for the task
  - `description` (string, optional): New description for the task
- **Response**:
  - Success: `{ "success": true, "data": { updated_task_object } }`
  - Error: `{ "success": false, "error": "error_message" }`
- **Behavior**: Updates specified fields of the task record, leaving others unchanged

## Security & Authorization
- All endpoints require a valid user_id parameter
- Operations are restricted to tasks belonging to the specified user
- User ID is validated to prevent unauthorized access to other users' tasks
- Input validation prevents injection attacks

## Error Handling
- Invalid user_id returns appropriate error
- Missing required parameters return validation error
- Non-existent task IDs return "not found" error
- Database errors return server error with descriptive message

## Performance Requirements
- Individual tool calls complete under 500ms
- Support for concurrent tool executions
- Proper database connection management
- Efficient querying with appropriate indexing

## Health Check
- **Endpoint**: `GET /health`
- **Response**: `{ "status": "healthy" }`
- **Purpose**: Monitor server availability