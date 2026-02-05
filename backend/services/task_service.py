from sqlmodel import Session, select
from typing import List, Optional
from models.task_model import Task, TaskCreate, TaskUpdate
from models.user import User


class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def create_task(self, task_data: TaskCreate, user_id: int) -> Task:
        """
        Create a new task for the specified user
        """
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=getattr(task_data, 'priority', "medium"),  # Use provided priority or default to "medium"
            completed=False
        )

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    def get_tasks(self, user_id: int, filter_completed: Optional[bool] = None, limit: Optional[int] = None) -> List[Task]:
        """
        Get all tasks for the specified user with optional filtering
        """
        from sqlmodel import select

        query = select(Task).where(Task.user_id == user_id)

        if filter_completed is not None:
            query = query.where(Task.completed == filter_completed)

        if limit:
            query = query.limit(limit)

        tasks = self.session.exec(query).all()
        return tasks

    def get_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """
        Get a specific task by ID for the specified user
        """
        from sqlmodel import select

        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.exec(query).first()
        return task

    def update_task(self, task_id: int, task_update: TaskUpdate, user_id: int) -> Optional[Task]:
        """
        Update a specific task for the specified user
        """
        from sqlmodel import select

        # Get task with direct query to avoid recursion
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.exec(query).first()

        if not task:
            return None

        # Update task fields based on provided data
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    def delete_task(self, task_id: int, user_id: int) -> bool:
        """
        Delete a specific task for the specified user
        """
        task = self.get_task(task_id, user_id)
        if not task:
            return False

        self.session.delete(task)
        self.session.commit()

        return True

    def complete_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """
        Mark a task as completed
        """
        from sqlmodel import select

        # Get task with direct query to avoid recursion
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.exec(query).first()

        if not task:
            return None

        task.completed = True
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task