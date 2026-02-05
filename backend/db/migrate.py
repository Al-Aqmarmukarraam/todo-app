"""
Database migration script for Todo AI Chatbot
Creates all necessary tables for the application
"""
from sqlmodel import SQLModel
from models.user import User
from models.task_model import Task
from models.conversation_model import Conversation
from models.message_model import Message
from db.database import engine


def create_db_and_tables():
    """
    Create all database tables
    """
    print("Creating database tables...")

    # Import all models to ensure they're registered with SQLModel
    from models.user import User
    from models.task_model import Task
    from models.conversation_model import Conversation
    from models.message_model import Message

    # Create all tables using SQLModel metadata
    SQLModel.metadata.create_all(engine)

    print("Database tables created successfully!")


if __name__ == "__main__":
    create_db_and_tables()