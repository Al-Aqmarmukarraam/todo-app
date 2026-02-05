from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List

if TYPE_CHECKING:
    from models.user import User
    from models.message_model import Message


class Conversation(SQLModel, table=True):
    """
    Conversation entity representing a chat session with a user
    """
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")


class ConversationCreate(SQLModel):
    """
    Schema for creating a new conversation
    """


class ConversationUpdate(SQLModel):
    """
    Schema for updating an existing conversation
    """


class ConversationRead(SQLModel):
    """
    Schema for reading conversation data (includes ID and all fields)
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime