"""Audit service to consume all task events and maintain audit logs"""
import asyncio
import json
from typing import Dict, Any
from dapr_client import dapr_client
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuditService:
    def __init__(self):
        self.dapr_client = dapr_client
        self.audit_log = []  # In a real implementation, this would be a database

    async def process_task_event(self, event_data: Dict[str, Any]):
        """Process a task event and log it to audit trail"""
        try:
            event_type = event_data.get("event_type")
            task_id = event_data.get("task_id")
            user_id = event_data.get("user_id")
            timestamp = event_data.get("timestamp")
            task_data = event_data.get("task_data", {})

            audit_entry = {
                "event_type": event_type,
                "task_id": task_id,
                "user_id": user_id,
                "timestamp": timestamp,
                "task_data_snapshot": task_data,
                "processed_at": datetime.utcnow().isoformat()
            }

            # In a real implementation, this would be saved to a persistent store
            self.audit_log.append(audit_entry)

            logger.info(f"Audit logged: {event_type} event for task {task_id} by user {user_id}")

            # For demo purposes, we'll just print the audit entry
            print(f"AUDIT LOGGED: {json.dumps(audit_entry, indent=2)}")

        except Exception as e:
            logger.error(f"Error processing audit event: {str(e)}")

    async def get_audit_trail(self, user_id: str = None, task_id: int = None, event_type: str = None):
        """Retrieve audit trail with optional filters"""
        filtered_logs = self.audit_log

        if user_id:
            filtered_logs = [log for log in filtered_logs if log["user_id"] == user_id]

        if task_id:
            filtered_logs = [log for log in filtered_logs if log["task_id"] == task_id]

        if event_type:
            filtered_logs = [log for log in filtered_logs if log["event_type"] == event_type]

        return filtered_logs

    async def start_consumer(self):
        """Start consuming task events from Kafka via Dapr for audit purposes"""
        logger.info("Starting audit service consumer...")

        # In a real implementation, this would use Dapr's subscribe functionality
        # For now, we'll simulate it with periodic checks
        while True:
            try:
                # In a real scenario, we would subscribe to the 'task-events' topic
                # and log all events to maintain an audit trail
                await asyncio.sleep(10)  # Wait for events
            except KeyboardInterrupt:
                logger.info("Audit service shutting down...")
                break
            except Exception as e:
                logger.error(f"Error in audit consumer loop: {str(e)}")
                await asyncio.sleep(5)  # Wait before retrying