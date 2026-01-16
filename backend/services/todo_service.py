from typing import List, Optional
from datetime import datetime
from models.todo import Todo, TodoCreate, TodoUpdate
from db.database import get_session
from sqlmodel import select


class TodoService:
    def create_todo(self, todo_create: TodoCreate) -> Todo:
        with next(get_session()) as session:
            todo = Todo(
                user_id=todo_create.user_id,
                title=todo_create.title,
                description=todo_create.description,
                completed=todo_create.completed
            )
            session.add(todo)
            session.commit()
            session.refresh(todo)
            return todo

    def get_todos_by_user(self, user_id: int) -> List[Todo]:
        """Get all todos for a specific user"""
        with next(get_session()) as session:
            statement = select(Todo).where(Todo.user_id == user_id)
            todos = session.exec(statement).all()
            return todos

    def get_all_todos(self) -> List[Todo]:
        with next(get_session()) as session:
            statement = select(Todo)
            todos = session.exec(statement).all()
            return todos

    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        with next(get_session()) as session:
            statement = select(Todo).where(Todo.id == todo_id)
            todo = session.exec(statement).first()
            return todo

    def get_todo_by_user_and_id(self, user_id: int, todo_id: int) -> Optional[Todo]:
        """Get a specific todo for a specific user"""
        with next(get_session()) as session:
            statement = select(Todo).where(Todo.user_id == user_id, Todo.id == todo_id)
            todo = session.exec(statement).first()
            return todo

    def update_todo(self, todo_id: int, todo_update: TodoUpdate) -> Optional[Todo]:
        with next(get_session()) as session:
            todo = session.get(Todo, todo_id)
            if not todo:
                return None

            update_data = todo_update.dict(exclude_unset=True)

            # Validate title if it's being updated
            if 'title' in update_data:
                title = update_data['title']
                if not title or len(title.strip()) == 0:
                    raise ValueError("Title cannot be empty")
                if len(title) > 255:
                    raise ValueError("Title must be less than 256 characters")

            # Validate description if it's being updated
            if 'description' in update_data:
                description = update_data['description']
                if description and len(description) > 1000:
                    raise ValueError("Description must be less than 1001 characters")

            for field, value in update_data.items():
                setattr(todo, field, value)

            todo.updated_at = datetime.now()
            session.add(todo)
            session.commit()
            session.refresh(todo)
            return todo

    def update_todo_for_user(self, user_id: int, todo_id: int, todo_update: TodoUpdate) -> Optional[Todo]:
        """Update a specific todo for a specific user"""
        with next(get_session()) as session:
            todo = session.exec(
                select(Todo).where(Todo.user_id == user_id, Todo.id == todo_id)
            ).first()

            if not todo:
                return None

            update_data = todo_update.dict(exclude_unset=True)

            # Validate title if it's being updated
            if 'title' in update_data:
                title = update_data['title']
                if not title or len(title.strip()) == 0:
                    raise ValueError("Title cannot be empty")
                if len(title) > 255:
                    raise ValueError("Title must be less than 256 characters")

            # Validate description if it's being updated
            if 'description' in update_data:
                description = update_data['description']
                if description and len(description) > 1000:
                    raise ValueError("Description must be less than 1001 characters")

            for field, value in update_data.items():
                setattr(todo, field, value)

            todo.updated_at = datetime.now()
            session.add(todo)
            session.commit()
            session.refresh(todo)
            return todo

    def delete_todo(self, todo_id: int) -> bool:
        with next(get_session()) as session:
            todo = session.get(Todo, todo_id)
            if not todo:
                return False

            session.delete(todo)
            session.commit()
            return True

    def delete_todo_for_user(self, user_id: int, todo_id: int) -> bool:
        """Delete a specific todo for a specific user"""
        with next(get_session()) as session:
            todo = session.exec(
                select(Todo).where(Todo.user_id == user_id, Todo.id == todo_id)
            ).first()

            if not todo:
                return False

            session.delete(todo)
            session.commit()
            return True

    def toggle_todo(self, todo_id: int) -> Optional[Todo]:
        with next(get_session()) as session:
            todo = session.get(Todo, todo_id)
            if not todo:
                return None

            todo.completed = not todo.completed
            todo.updated_at = datetime.now()
            session.add(todo)
            session.commit()
            session.refresh(todo)
            return todo

    def toggle_todo_for_user(self, user_id: int, todo_id: int) -> Optional[Todo]:
        """Toggle completion status for a specific todo of a specific user"""
        with next(get_session()) as session:
            todo = session.exec(
                select(Todo).where(Todo.user_id == user_id, Todo.id == todo_id)
            ).first()

            if not todo:
                return None

            todo.completed = not todo.completed
            todo.updated_at = datetime.now()
            session.add(todo)
            session.commit()
            session.refresh(todo)
            return todo


# Global instance
todo_service = TodoService()