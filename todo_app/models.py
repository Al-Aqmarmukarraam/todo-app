"""
Data models for the Todo application.

This module defines the data structures used in the application,
including the Todo entity and in-memory storage mechanisms.
"""
from datetime import datetime
from typing import Dict, Optional


class Todo:
    """
    Represents a todo item with id, title, description, completion status, and creation timestamp.
    """

    def __init__(self, id: int, title: str, description: Optional[str] = None,
                 completed: bool = False, created_at: Optional[datetime] = None):
        """
        Initialize a Todo instance.

        Args:
            id: Unique identifier for the todo
            title: Title of the todo (required)
            description: Optional description of the todo
            completed: Completion status (default: False)
            created_at: Creation timestamp (default: current time)
        """
        self.id = id
        self.title = title.strip() if title else ""
        self.description = description
        self.completed = completed
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict:
        """
        Convert the Todo instance to a dictionary representation.

        Returns:
            Dictionary representation of the Todo
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat()
        }

    def __repr__(self) -> str:
        """
        String representation of the Todo instance.

        Returns:
            String representation
        """
        return f"Todo(id={self.id}, title='{self.title}', completed={self.completed})"


# Global in-memory storage for todos
todos: Dict[int, Todo] = {}

# Global counter for next available ID
next_id: int = 1


def generate_next_id() -> int:
    """
    Generate and return the next available ID for a new todo.

    Returns:
        The next available ID
    """
    global next_id
    current_id = next_id
    next_id += 1
    return current_id


def validate_todo_id(todo_id: int) -> bool:
    """
    Validate if a todo ID exists in the storage.

    Args:
        todo_id: The ID to validate

    Returns:
        True if the ID exists, False otherwise
    """
    if not isinstance(todo_id, int):
        raise TypeError("Todo ID must be an integer")
    return todo_id in todos


def reset_storage():
    """
    Reset the in-memory storage for testing purposes.
    This clears all todos and resets the ID counter.
    """
    global todos, next_id
    todos = {}
    next_id = 1