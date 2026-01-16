from fastapi import APIRouter, HTTPException, Header
from typing import List
from models.todo import Todo, TodoCreate, TodoUpdate
from services.todo_service import todo_service
from utils.auth import get_current_user_id

router = APIRouter()


@router.post("/todos", response_model=Todo, status_code=201)
async def create_todo(todo_create: TodoCreate, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the user_id in the request matches the authenticated user
    if todo_create.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Cannot create todo for another user")

    return todo_service.create_todo(todo_create)


# Endpoint to create tasks by user_id (as specified in task requirements)
@router.post("/{user_id}/tasks", response_model=Todo, status_code=201)
async def create_task_for_user(user_id: int, todo_create: TodoCreate, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot create task for another user")

    # Also ensure the user_id in the request body matches
    if todo_create.user_id != current_user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch in request body")

    return todo_service.create_todo(todo_create)


@router.get("/todos", response_model=List[Todo])
async def get_todos(authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Return only the todos that belong to the current user
    return todo_service.get_todos_by_user(current_user_id)


# Endpoint to fetch user's tasks by user_id (as specified in task requirements)
@router.get("/{user_id}/tasks", response_model=List[Todo])
async def get_user_tasks(user_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot access another user's tasks")

    # Return only the todos that belong to the current user
    return todo_service.get_todos_by_user(current_user_id)


@router.get("/todos/{todo_id}", response_model=Todo)
async def get_todo(todo_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    todo = todo_service.get_todo_by_user_and_id(current_user_id, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo_update: TodoUpdate, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    todo = todo_service.update_todo_for_user(current_user_id, todo_id, todo_update)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


# Endpoint to update tasks by user_id and task_id (as specified in task requirements)
@router.put("/{user_id}/tasks/{todo_id}", response_model=Todo)
async def update_task_for_user(user_id: int, todo_id: int, todo_update: TodoUpdate, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot update another user's task")

    todo = todo_service.update_todo_for_user(current_user_id, todo_id, todo_update)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    success = todo_service.delete_todo_for_user(current_user_id, todo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}


# Endpoint to delete tasks by user_id and task_id (as specified in task requirements)
@router.delete("/{user_id}/tasks/{todo_id}")
async def delete_task_for_user(user_id: int, todo_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot delete another user's task")

    success = todo_service.delete_todo_for_user(current_user_id, todo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}


@router.patch("/todos/{todo_id}/toggle", response_model=Todo)
async def toggle_todo(todo_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    todo = todo_service.toggle_todo_for_user(current_user_id, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


# Endpoint to toggle completion by user_id and task_id (as specified in task requirements)
@router.patch("/{user_id}/tasks/{todo_id}/complete", response_model=Todo)
async def toggle_task_completion(user_id: int, todo_id: int, authorization: str = Header(...)):
    current_user_id = get_current_user_id(authorization)

    # Ensure the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cannot toggle completion for another user's task")

    todo = todo_service.toggle_todo_for_user(current_user_id, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo