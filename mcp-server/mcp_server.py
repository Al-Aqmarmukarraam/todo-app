"""
MCP Server for Todo AI Chatbot
Provides deterministic tools for task management operations
"""
import asyncio
import json
import sys
import os
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

# Add backend to path to import models and services
import sys
import os
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.append(backend_path)

from db.database import get_session, engine
from models.task_model import Task, TaskCreate, TaskUpdate
from models.user import User
from services.task_service import TaskService


class ToolCall(BaseModel):
    """
    Represents a tool call from the AI agent
    """
    id: str
    type: str
    function: Dict[str, Any]


class ToolResult(BaseModel):
    """
    Represents the result of a tool call
    """
    success: bool
    data: Any = None
    error: str = None


class AddTaskParams(BaseModel):
    """
    Parameters for add_task tool
    """
    user_id: str
    title: str
    description: str = None


class ListTasksParams(BaseModel):
    """
    Parameters for list_tasks tool
    """
    user_id: str
    status: str = "all"  # "all" | "pending" | "completed"


class CompleteTaskParams(BaseModel):
    """
    Parameters for complete_task tool
    """
    user_id: str
    task_id: int


class DeleteTaskParams(BaseModel):
    """
    Parameters for delete_task tool
    """
    user_id: str
    task_id: int


class UpdateTaskParams(BaseModel):
    """
    Parameters for update_task tool
    """
    user_id: str
    task_id: int
    title: str = None
    description: str = None


class MCPServer:
    def __init__(self):
        self.app = FastAPI(title="Todo AI Chatbot MCP Server")

        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Register tool endpoints
        self._register_tools()

    def _register_tools(self):
        """
        Register all available tools
        """
        @self.app.post("/tools/add_task")
        def add_task(request_data: Dict[str, Any]):
            """
            Add a new task for the user
            """
            try:
                # Extract user_id and parameters from the request data
                user_id_str = request_data.get("user_id")
                if user_id_str is None:
                    return ToolResult(success=False, error="user_id is required")

                # Convert user_id to integer since it comes as string
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return ToolResult(success=False, error="user_id must be a valid integer")

                # Parse the parameters including user_id
                params = AddTaskParams(**request_data)

                with Session(engine) as session:
                    task_service = TaskService(session)

                    # Convert params to TaskCreate model
                    task_create = TaskCreate(
                        title=params.title,
                        description=params.description
                    )

                    task = task_service.create_task(task_create, user_id)

                    return ToolResult(success=True, data=task.dict())
            except Exception as e:
                return ToolResult(success=False, error=str(e))

        @self.app.post("/tools/list_tasks")
        def list_tasks(request_data: Dict[str, Any]):
            """
            List tasks for the user
            """
            try:
                # Extract user_id and parameters from the request data
                user_id_str = request_data.get("user_id")
                if user_id_str is None:
                    return ToolResult(success=False, error="user_id is required")

                # Convert user_id to integer since it comes as string
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return ToolResult(success=False, error="user_id must be a valid integer")

                # Parse the parameters including user_id
                params = ListTasksParams(**request_data)

                with Session(engine) as session:
                    task_service = TaskService(session)

                    # Apply filters based on status parameter
                    filter_completed = None
                    if params.status == "completed":
                        filter_completed = True
                    elif params.status == "pending":
                        filter_completed = False
                    # If status is "all", leave filter_completed as None

                    tasks = task_service.get_tasks(
                        user_id=user_id,
                        filter_completed=filter_completed,
                        limit=None  # No limit specified in the spec
                    )

                    return ToolResult(success=True, data=[task.dict() for task in tasks])
            except Exception as e:
                return ToolResult(success=False, error=str(e))

        @self.app.post("/tools/complete_task")
        def complete_task(request_data: Dict[str, Any]):
            """
            Mark a task as completed
            """
            try:
                # Extract user_id and parameters from the request data
                user_id_str = request_data.get("user_id")
                if user_id_str is None:
                    return ToolResult(success=False, error="user_id is required")

                # Convert user_id to integer since it comes as string
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return ToolResult(success=False, error="user_id must be a valid integer")

                # Parse the parameters including user_id
                params = CompleteTaskParams(**request_data)

                with Session(engine) as session:
                    task_service = TaskService(session)

                    task = task_service.complete_task(params.task_id, user_id)

                    if task:
                        return ToolResult(success=True, data=task.dict())
                    else:
                        return ToolResult(success=False, error="Task not found")
            except Exception as e:
                return ToolResult(success=False, error=str(e))

        @self.app.post("/tools/delete_task")
        def delete_task(request_data: Dict[str, Any]):
            """
            Delete a task
            """
            try:
                # Extract user_id and parameters from the request data
                user_id_str = request_data.get("user_id")
                if user_id_str is None:
                    return ToolResult(success=False, error="user_id is required")

                # Convert user_id to integer since it comes as string
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return ToolResult(success=False, error="user_id must be a valid integer")

                # Parse the parameters including user_id
                params = DeleteTaskParams(**request_data)

                with Session(engine) as session:
                    task_service = TaskService(session)

                    success = task_service.delete_task(params.task_id, user_id)

                    if success:
                        return ToolResult(success=True)
                    else:
                        return ToolResult(success=False, error="Task not found")
            except Exception as e:
                return ToolResult(success=False, error=str(e))

        @self.app.post("/tools/update_task")
        def update_task(request_data: Dict[str, Any]):
            """
            Update a task
            """
            try:
                # Extract user_id and parameters from the request data
                user_id_str = request_data.get("user_id")
                if user_id_str is None:
                    return ToolResult(success=False, error="user_id is required")

                # Convert user_id to integer since it comes as string
                try:
                    user_id = int(user_id_str)
                except ValueError:
                    return ToolResult(success=False, error="user_id must be a valid integer")

                # Parse the parameters including user_id
                params = UpdateTaskParams(**request_data)

                with Session(engine) as session:
                    task_service = TaskService(session)

                    # Create TaskUpdate from the available parameters
                    # Only include fields that are not None
                    update_data = {}
                    if params.title is not None:
                        update_data['title'] = params.title
                    if params.description is not None:
                        update_data['description'] = params.description

                    task_update = TaskUpdate(**update_data)

                    task = task_service.update_task(params.task_id, task_update, user_id)

                    if task:
                        return ToolResult(success=True, data=task.dict())
                    else:
                        return ToolResult(success=False, error="Task not found")
            except Exception as e:
                return ToolResult(success=False, error=str(e))

        # Health check endpoint
        @self.app.get("/health")
        def health_check():
            return {"status": "healthy"}

    def run(self, host="0.0.0.0", port=8001):
        """
        Run the MCP server
        """
        import uvicorn
        uvicorn.run(self.app, host=host, port=port)


# Global instance for easy access
mcp_server = MCPServer()
app = mcp_server.app


if __name__ == "__main__":
    mcp_server.run()