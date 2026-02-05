"""Dapr client for publishing events to Kafka via Dapr Pub/Sub"""
import httpx
import asyncio
from typing import Dict, Any
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

class DaprClient:
    def __init__(self):
        self.base_url = f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}"
        self.dapr_available = True  # Flag to track if Dapr is available

    async def publish_event(self, topic: str, event_data: Dict[str, Any]) -> bool:
        """Publish an event to a Kafka topic via Dapr Pub/Sub"""
        if not self.dapr_available:
            logger.warning(f"Dapr not available, skipping event publish to topic {topic}")
            return False

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1.0/publish/pubsub/{topic}",
                    json=event_data,
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code == 200:
                    logger.info(f"Successfully published event to topic {topic}")
                    return True
                else:
                    logger.error(f"Failed to publish event to topic {topic}. Status: {response.status_code}, Response: {response.text}")
                    # Temporarily disable Dapr if it's consistently failing
                    if response.status_code in [502, 503, 504]:  # Gateway errors
                        self.dapr_available = False
                    return False
        except httpx.ConnectError:
            logger.error(f"Dapr sidecar not available at {self.base_url}, disabling Dapr temporarily")
            self.dapr_available = False
            return False
        except Exception as e:
            logger.error(f"Exception while publishing event to topic {topic}: {str(e)}")
            # For network-related exceptions, temporarily disable Dapr
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                self.dapr_available = False
            return False

    async def publish_task_event(self, event_type: str, task_id: int, task_data: Dict[str, Any], user_id: str) -> bool:
        """Publish a task-related event"""
        event_data = {
            "event_type": event_type,
            "task_id": task_id,
            "task_data": task_data,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        return await self.publish_event("task-events", event_data)

    async def publish_reminder_event(self, task_id: int, title: str, due_at: str, remind_at: str, user_id: str) -> bool:
        """Publish a reminder event"""
        event_data = {
            "task_id": task_id,
            "title": title,
            "due_at": due_at,
            "remind_at": remind_at,
            "user_id": user_id
        }
        return await self.publish_event("reminders", event_data)

    async def publish_task_update_event(self, operation: str, task_id: int, task_data: Dict[str, Any], user_id: str) -> bool:
        """Publish a task update event for real-time sync"""
        event_data = {
            "operation": operation,
            "task_id": task_id,
            "task_data": task_data,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        return await self.publish_event("task-updates", event_data)

    def reset_dapr_availability(self):
        """Reset the Dapr availability flag"""
        self.dapr_available = True

# Global instance
dapr_client = DaprClient()