"""Notification service to consume reminder events and send notifications"""
import asyncio
import httpx
from typing import Dict, Any
from dapr_client import dapr_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.dapr_client = dapr_client

    async def process_reminder_event(self, reminder_data: Dict[str, Any]):
        """Process a reminder event and send notification"""
        try:
            task_id = reminder_data.get("task_id")
            title = reminder_data.get("title")
            user_id = reminder_data.get("user_id")

            logger.info(f"Processing reminder for task {task_id}, title: {title}, user: {user_id}")

            # Simulate sending notification - in real implementation, this would send email/push notification
            # For now, we'll just log it
            notification_result = await self.send_notification(user_id, title, task_id)

            if notification_result:
                logger.info(f"Notification sent successfully for task {task_id}")
            else:
                logger.error(f"Failed to send notification for task {task_id}")

        except Exception as e:
            logger.error(f"Error processing reminder event: {str(e)}")

    async def send_notification(self, user_id: str, title: str, task_id: int) -> bool:
        """Send actual notification to user (email/push)"""
        try:
            # This is a mock implementation - in reality, this would integrate with email service,
            # push notification service, etc.
            print(f"NOTIFICATION SENT: Reminder for task '{title}' (ID: {task_id}) to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False

    async def start_consumer(self):
        """Start consuming reminder events from Kafka via Dapr"""
        logger.info("Starting notification service consumer...")

        # In a real implementation, this would use Dapr's subscribe functionality
        # For now, we'll simulate it with periodic checks
        while True:
            try:
                # In a real scenario, we would subscribe to the 'reminders' topic
                # and get callbacks when new events arrive
                await asyncio.sleep(10)  # Wait for events
            except KeyboardInterrupt:
                logger.info("Notification service shutting down...")
                break
            except Exception as e:
                logger.error(f"Error in notification consumer loop: {str(e)}")
                await asyncio.sleep(5)  # Wait before retrying