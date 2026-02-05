from sqlmodel import Session, select
from typing import List, Optional
from models.message_model import Message, MessageCreate, MessageUpdate
from datetime import datetime


class MessageService:
    def __init__(self, session: Session):
        self.session = session

    def create_message(self, message_data: MessageCreate) -> Message:
        """
        Create a new message in a conversation
        """
        message = Message(
            user_id=message_data.user_id,
            conversation_id=message_data.conversation_id,
            role=message_data.role,
            content=message_data.content
        )

        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)

        return message

    def get_messages(self, conversation_id: int) -> List[Message]:
        """
        Get all messages in a conversation
        """
        from sqlmodel import select

        query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
        messages = self.session.exec(query).all()
        return messages

    def get_message(self, message_id: int, conversation_id: int) -> Optional[Message]:
        """
        Get a specific message by ID in a conversation
        """
        from sqlmodel import select

        query = select(Message).where(
            Message.id == message_id,
            Message.conversation_id == conversation_id
        )
        message = self.session.exec(query).first()
        return message

    def update_message(self, message_id: int, message_update: MessageUpdate, conversation_id: int) -> Optional[Message]:
        """
        Update a specific message in a conversation
        """
        from sqlmodel import select

        # Get message with direct query to avoid recursion
        query = select(Message).where(
            Message.id == message_id,
            Message.conversation_id == conversation_id
        )
        message = self.session.exec(query).first()

        if not message:
            return None

        # Update message fields based on provided data
        update_data = message_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(message, field, value)

        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)

        return message

    def delete_message(self, message_id: int, conversation_id: int) -> bool:
        """
        Delete a specific message in a conversation
        """
        message = self.get_message(message_id, conversation_id)
        if not message:
            return False

        self.session.delete(message)
        self.session.commit()

        return True

    def get_latest_messages(self, conversation_id: int, limit: int = 10) -> List[Message]:
        """
        Get the latest messages in a conversation
        """
        from sqlmodel import select

        query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).limit(limit)
        messages = self.session.exec(query).all()
        # Reverse to get chronological order
        return messages[::-1]