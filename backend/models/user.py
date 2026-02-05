from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from typing import TYPE_CHECKING
from utils.password_utils import hash_password

# Import related models to resolve relationship issues
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
        """Hash the password using bcrypt"""
        return hash_password(self.password)


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None


class UserRead(SQLModel):
    id: int
    email: str
    username: str
    created_at: datetime