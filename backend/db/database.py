from sqlmodel import create_engine, Session
from sqlalchemy import event
from sqlalchemy.engine import Engine
import os
from typing import Generator

# Get database URL from environment, with a default for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create the engine
engine = create_engine(DATABASE_URL, echo=True)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


# Create all tables
def create_db_and_tables():
    from models.user import User
    from models.todo import Todo
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)