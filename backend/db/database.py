from sqlmodel import create_engine, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
import os

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_chatbot.db")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


# Create all tables
def create_db_and_tables():
    # Import all models to ensure they're registered with SQLModel
    from models.user import User
    from models.task_model import Task
    from models.conversation_model import Conversation
    from models.message_model import Message

    # Create all tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)