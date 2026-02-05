from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional, List
from models.task_model import Task, TaskCreate, TaskUpdate, TaskRead
from models.user import User
from services.task_service import TaskService
from utils.auth import get_current_user
from db.database import get_session
from dapr_client import dapr_client
import asyncio

router = APIRouter(tags=["tasks"])


import logging
logger = logging.getLogger(__name__)

@router.post("/tasks", response_model=TaskRead)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user
    """
    logger.info(f"Received task creation request for user {current_user.id}")
    logger.info(f"Task data: {task_data}")

    user_id = current_user.id
    task_service = TaskService(session)
    task = task_service.create_task(task_data, user_id)

    # Publish task creation event
    task_dict = {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat()
    }

    # Skip Dapr event publishing for now to avoid connection issues
    # The task is created successfully regardless
    pass

    return task


@router.get("/tasks", response_model=List[TaskRead])
async def get_tasks(
    filter_completed: Optional[bool] = None,
    limit: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the authenticated user
    """
    user_id = current_user.id
    task_service = TaskService(session)
    tasks = task_service.get_tasks(user_id, filter_completed, limit)
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the authenticated user
    """
    user_id = current_user.id
    task_service = TaskService(session)
    task = task_service.get_task(task_id, user_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task for the authenticated user
    """
    user_id = current_user.id
    task_service = TaskService(session)
    task = task_service.update_task(task_id, task_update, user_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish task update event
    task_dict = {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat()
    }

    # Skip Dapr event publishing for now to avoid connection issues
    # The task is updated successfully regardless
    pass

    return task


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task for the authenticated user
    """
    user_id = current_user.id
    task_service = TaskService(session)
    deleted = task_service.delete_task(task_id, user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish task deletion event (skip if dapr not available)
    try:
        asyncio.create_task(dapr_client.publish_task_event("deleted", task_id, {}, str(user_id)))
    except Exception as e:
        logger.error(f"Failed to publish task deletion event: {str(e)}")
        # Continue without Dapr if it's not available
        pass

    return {"message": "Task deleted successfully"}


@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark a task as completed
    """
    user_id = current_user.id
    task_service = TaskService(session)
    task = task_service.complete_task(task_id, user_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish task completion event
    task_dict = {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat()
    }

    # Publish task event (skip if dapr not available)
    try:
        asyncio.create_task(dapr_client.publish_task_event("completed", task.id, task_dict, str(user_id)))
    except Exception as e:
        logger.error(f"Failed to publish task completion event: {str(e)}")
        # Continue without Dapr if it's not available
        pass

    return task