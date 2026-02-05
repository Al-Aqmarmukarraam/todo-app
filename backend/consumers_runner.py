"""Runner script to start all consumer services"""
import asyncio
import logging
from sqlmodel import Session
from db.database import engine
from services.notification_service import NotificationService
from services.recurring_task_service import RecurringTaskService
from services.audit_service import AuditService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_consumers():
    """Run all consumer services"""
    logger.info("Starting consumer services...")

    # Create notification service
    notification_service = NotificationService()

    # Create audit service
    audit_service = AuditService()

    # Create database session for recurring task service
    with Session(engine) as session:
        recurring_task_service = RecurringTaskService(session)

        # Start all services (they run indefinitely)
        import threading

        def run_notification():
            import asyncio
            asyncio.run(notification_service.start_consumer())

        def run_recurring():
            import asyncio
            asyncio.run(recurring_task_service.start_consumer())

        def run_audit():
            import asyncio
            asyncio.run(audit_service.start_consumer())

        # Start each service in a separate thread
        notification_thread = threading.Thread(target=run_notification)
        recurring_thread = threading.Thread(target=run_recurring)
        audit_thread = threading.Thread(target=run_audit)

        notification_thread.start()
        recurring_thread.start()
        audit_thread.start()

        # Wait for all threads
        notification_thread.join()
        recurring_thread.join()
        audit_thread.join()

if __name__ == "__main__":
    try:
        run_consumers()
    except KeyboardInterrupt:
        logger.info("Shutting down consumer services...")