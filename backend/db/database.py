from sqlmodel import create_engine, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Database URL from environment variable - PostgreSQL for Neon
NEON_DB_URL = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

# Try to use PostgreSQL if Neon credentials are available, otherwise fall back to SQLite for development
if NEON_DB_URL and NEON_DB_URL.strip():  # Check if a DB URL is provided
    DATABASE_URL = NEON_DB_URL
    try:
        # Create engine with connection pooling for PostgreSQL
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
            # Add options to handle Neon's connection behavior
            connect_args={
                "sslmode": "require",  # Required for Neon connections
            }
        )
        # Test the connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to PostgreSQL database")
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL database: {e}. Falling back to SQLite.")
        # Fallback to SQLite for development when PostgreSQL connection fails
        DATABASE_URL = "sqlite:///./todo_chatbot_local.db"
        engine = create_engine(DATABASE_URL)
else:
    # Fallback to SQLite for development when no DB URL is provided
    DATABASE_URL = "sqlite:///./todo_chatbot_local.db"
    engine = create_engine(DATABASE_URL)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


# Create all tables
def create_db_and_tables():
    # Import models to ensure they're registered with SQLModel
    # Import in a specific order to help resolve circular dependencies
    from models.task_model import Task
    from models.message_model import Message
    from models.conversation_model import Conversation
    from models.user import User

    import logging
    logger = logging.getLogger(__name__)

    try:
        # Create all tables using SQLModel metadata
        from sqlmodel import SQLModel
        logger.info("Creating database tables if they don't exist...")

        # Prepare the registry to handle circular dependencies
        from db.model_registry import sqlmodel_registry
        # This ensures all relationships are properly mapped

        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")

    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise