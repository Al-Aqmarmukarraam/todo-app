#!/usr/bin/env python3
"""
Simple test script to debug the task creation issue
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from sqlmodel import SQLModel, create_engine
from datetime import datetime

# Import only the task-related models to avoid circular dependencies
from models.task_model import Task, TaskCreate

def test_task_creation():
    print("Testing task creation...")

    # Create an in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:")

    # Create only the task table to avoid circular dependencies
    from sqlalchemy import text
    with engine.connect() as conn:
        # Create the task table manually to avoid loading other models
        conn.execute(text("""
            CREATE TABLE task (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title VARCHAR NOT NULL,
                description VARCHAR,
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                priority VARCHAR NOT NULL DEFAULT 'medium',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES user(id)
            )
        """))
        conn.execute(text("""
            CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR NOT NULL,
                username VARCHAR NOT NULL,
                password_hash VARCHAR NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN NOT NULL DEFAULT TRUE
            )
        """))
        conn.commit()

    # Now test task creation
    from sqlmodel import Session
    from services.task_service import TaskService

    with Session(engine) as session:
        # Create task data without priority to simulate the API call
        task_data = TaskCreate(
            title="Test Task",
            description="Test Description"
        )

        print(f"Task data: {task_data}")
        print(f"Task data dict: {task_data.__dict__}")

        # Create task service and try to create task
        task_service = TaskService(session)

        try:
            task = task_service.create_task(task_data, user_id=1)
            print(f"Created task: {task}")
            print(f"Task priority: {task.priority}")
            print("SUCCESS: Task creation worked!")
        except Exception as e:
            print(f"Error creating task: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_task_creation()