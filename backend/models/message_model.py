from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models.conversation_model import Conversation


class Message(SQLModel, table=True):
    """
    Message entity representing a chat message in a conversation
    """
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str = Field(sa_column_kwargs={"server_default": "'user'"})  # 'user' or 'assistant'
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")


class MessageCreate(SQLModel):
    """
    Schema for creating a new message
    """
    user_id: int
    conversation_id: int
    role: str  # 'user' or 'assistant'
    content: str


class MessageUpdate(SQLModel):
    """
    Schema for updating an existing message
    """
    content: Optional[str] = None


class MessageRead(SQLModel):
    """
    Schema for reading message data (includes ID and all fields)
    """
    id: int
    user_id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime