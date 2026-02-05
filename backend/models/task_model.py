from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User


class Task(SQLModel, table=True):
    """
    Task entity representing a user's task with properties like title, description, etc.
    """
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, sa_column_kwargs={"server_default": "false"})
    priority: str = Field(default="medium")  # low, medium, high
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="tasks")


class TaskCreate(SQLModel):
    """
    Schema for creating a new task
    """
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"  # Default priority


class TaskUpdate(SQLModel):
    """
    Schema for updating an existing task
    """
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None


class TaskRead(SQLModel):
    """
    Schema for reading task data (includes ID and all fields)
    """
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    completed: bool
    priority: str
    created_at: datetime
    updated_at: datetime