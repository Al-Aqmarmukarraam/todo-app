from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import hashlib


class UserBase(SQLModel):
    email: str
    username: str


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str = Field()
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=True)


class UserCreate(UserBase):
    password: str

    def hash_password(self) -> str:
        """Hash the password using SHA-256"""
        return hashlib.sha256(self.password.encode()).hexdigest()


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None