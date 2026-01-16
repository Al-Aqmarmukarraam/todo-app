"""
Operations module for the Todo application.

This module contains the business logic for todo operations
such as adding, updating, deleting, and viewing todos.
"""
from typing import Dict, Optional
from datetime import datetime
from .models import Todo, todos, generate_next_id


def add_todo(title: str, description: Optional[str] = None) -> int:
    """
    Add a new todo with the given title and optional description.

    Args:
        title: The title of the todo (required)
        description: Optional description of the todo

    Returns:
        The ID of the newly created todo

    Raises:
        ValueError: If the title is empty after trimming whitespace
        TypeError: If the title is not a string
    """
    # Validate the title type
    if not isinstance(title, str):
        raise TypeError("Title must be a string")

    # Validate the description type if provided
    if description is not None and not isinstance(description, str):
        raise TypeError("Description must be a string or None")

    # Validate the title - it must not be empty after trimming
    if not title or not title.strip():
        raise ValueError("Title cannot be empty or consist only of whitespace")

    # Generate a unique ID for the new todo
    todo_id = generate_next_id()

    # Create a new Todo instance
    new_todo = Todo(
        id=todo_id,
        title=title.strip(),
        description=description,
        completed=False,
        created_at=datetime.now()
    )

    # Store the new todo in the in-memory storage
    todos[todo_id] = new_todo

    # Return the ID of the newly created todo
    return todo_id


def get_all_todos() -> list:
    """
    Get all todos from the in-memory storage.

    Returns:
        A list of all todos, sorted by creation order (ID)
    """
    # Return todos sorted by ID to maintain creation order
    return sorted(todos.values(), key=lambda todo: todo.id)


def update_todo(todo_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool:
    """
    Update an existing todo with the provided title and/or description.

    Args:
        todo_id: The ID of the todo to update
        title: Optional new title for the todo
        description: Optional new description for the todo

    Returns:
        True if the todo was successfully updated, False if the todo doesn't exist

    Raises:
        ValueError: If the title is provided but is empty after trimming whitespace
        TypeError: If the todo_id is not an integer
    """
    from .models import validate_todo_id

    # Validate the todo ID
    if not validate_todo_id(todo_id):
        return False

    # Get the existing todo
    todo = todos[todo_id]

    # Validate the new title if provided
    if title is not None:
        if not isinstance(title, str):
            raise TypeError("Title must be a string")
        if not title or not title.strip():
            raise ValueError("Title cannot be empty or consist only of whitespace")
        todo.title = title.strip()

    # Update the description if provided
    if description is not None:
        if not isinstance(description, str) and description is not None:
            raise TypeError("Description must be a string or None")
        todo.description = description

    # Return success
    return True


def delete_todo(todo_id: int) -> bool:
    """
    Delete an existing todo by its ID.

    Args:
        todo_id: The ID of the todo to delete

    Returns:
        True if the todo was successfully deleted, False if the todo doesn't exist

    Raises:
        TypeError: If the todo_id is not an integer
    """
    from .models import validate_todo_id

    # Validate the todo ID
    if not validate_todo_id(todo_id):
        return False

    # Remove the todo from the storage
    del todos[todo_id]

    # Return success
    return True


def mark_todo_completed(todo_id: int, completed: bool) -> bool:
    """
    Mark a todo as complete or incomplete.

    Args:
        todo_id: The ID of the todo to update
        completed: The completion status to set (True for complete, False for incomplete)

    Returns:
        True if the todo was successfully updated, False if the todo doesn't exist

    Raises:
        TypeError: If the todo_id is not an integer or completed is not a boolean
    """
    from .models import validate_todo_id

    # Validate the todo ID
    if not validate_todo_id(todo_id):
        return False

    # Validate the completed parameter
    if not isinstance(completed, bool):
        raise TypeError("Completed status must be a boolean")

    # Get the existing todo
    todo = todos[todo_id]

    # Update the completion status
    todo.completed = completed

    # Return success
    return True