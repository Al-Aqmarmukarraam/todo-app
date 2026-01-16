from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import hashlib
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.task_model import Task
    from models.conversation_model import Conversation


class UserBase(SQLModel):
    email: str
    username: str


class User(UserBase, table=True):
    __tablename__ = "user"

    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str = Field(sa_column_kwargs={"nullable": False})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    conversations: List["Conversation"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str

    def hash_password(self) -> str:
        """Hash the password using SHA-256"""
        return hashlib.sha256(self.password.encode()).hexdigest()


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None


class UserRead(SQLModel):
    id: int
    email: str
    username: str
    created_at: datetime