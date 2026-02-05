"""Recurring task service to consume task completion events and create new recurring tasks"""
import asyncio
import httpx
from typing import Dict, Any
from sqlmodel import Session, select
from models.task_model import Task, TaskCreate
from dapr_client import dapr_client
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecurringTaskService:
    def __init__(self, session: Session):
        self.session = session
        self.dapr_client = dapr_client

    async def process_task_completion_event(self, task_data: Dict[str, Any]):
        """Process a task completion event and create new recurring task if applicable"""
        try:
            task_id = task_data.get("task_id")
            original_task_data = task_data.get("task_data", {})

            logger.info(f"Processing task completion event for task {task_id}")

            # For this implementation, we'll assume tasks with certain titles are recurring
            # In a real implementation, this would check for a recurrence pattern in the task
            title = original_task_data.get("title", "")

            # Check if this task is marked as recurring (in a real app, we'd have a recurrence field)
            if "recurs" in title.lower() or "repeat" in title.lower() or "daily" in title.lower():
                await self.create_recurring_task(original_task_data)
            else:
                logger.info(f"Task {task_id} is not recurring, skipping")

        except Exception as e:
            logger.error(f"Error processing task completion event: {str(e)}")

    async def create_recurring_task(self, original_task: Dict[str, Any]):
        """Create a new instance of a recurring task"""
        try:
            user_id = original_task.get("user_id")
            title = original_task.get("title", "")
            description = original_task.get("description")
            priority = original_task.get("priority", "medium")

            # Calculate next occurrence (for demo purposes, we'll set it for tomorrow)
            next_due_date = None
            if original_task.get("due_date"):
                from datetime import datetime
                # Parse the original due date and add 1 day for daily recurrence
                orig_date = datetime.fromisoformat(original_task["due_date"].replace('Z', '+00:00'))
                next_due_date = orig_date + timedelta(days=1)

            # Create new task instance
            new_task = Task(
                user_id=user_id,
                title=f"[RECURRING] {title}",
                description=description,
                due_date=next_due_date,
                priority=priority,
                completed=False
            )

            self.session.add(new_task)
            self.session.commit()
            self.session.refresh(new_task)

            logger.info(f"Created new recurring task instance: {new_task.id} for user {user_id}")

            # Publish event for new task creation
            task_dict = {
                "id": new_task.id,
                "user_id": new_task.user_id,
                "title": new_task.title,
                "description": new_task.description,
                "due_date": new_task.due_date.isoformat() if new_task.due_date else None,
                "priority": new_task.priority,
                "completed": new_task.completed,
                "created_at": new_task.created_at.isoformat(),
                "updated_at": new_task.updated_at.isoformat()
            }

            # Publish task event
            await self.dapr_client.publish_task_event("created", new_task.id, task_dict, str(user_id))

            # If due date is set, publish reminder event
            if new_task.due_date:
                await self.dapr_client.publish_reminder_event(
                    new_task.id,
                    new_task.title,
                    new_task.due_date.isoformat(),
                    new_task.due_date.isoformat(),  # For now, remind at due date
                    str(user_id)
                )

        except Exception as e:
            logger.error(f"Error creating recurring task: {str(e)}")

    async def start_consumer(self):
        """Start consuming task completion events from Kafka via Dapr"""
        logger.info("Starting recurring task service consumer...")

        # In a real implementation, this would use Dapr's subscribe functionality
        # For now, we'll simulate it with periodic checks
        while True:
            try:
                # In a real scenario, we would subscribe to the 'task-events' topic
                # and filter for completion events
                await asyncio.sleep(10)  # Wait for events
            except KeyboardInterrupt:
                logger.info("Recurring task service shutting down...")
                break
            except Exception as e:
                logger.error(f"Error in recurring task consumer loop: {str(e)}")
                await asyncio.sleep(5)  # Wait before retrying