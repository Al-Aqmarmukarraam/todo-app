from sqlmodel import Session, select
from typing import List, Optional
from models.conversation_model import Conversation, ConversationCreate, ConversationUpdate
from models.message_model import Message, MessageCreate


class ConversationService:
    def __init__(self, session: Session):
        self.session = session

    def create_conversation(self, conversation_data: ConversationCreate, user_id: int) -> Conversation:
        """
        Create a new conversation for the specified user
        """
        conversation = Conversation(
            user_id=user_id
        )

        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)

        return conversation

    def get_conversations(self, user_id: int) -> List[Conversation]:
        """
        Get all conversations for the specified user
        """
        from sqlmodel import select

        query = select(Conversation).where(Conversation.user_id == user_id)
        conversations = self.session.exec(query).all()
        return conversations

    def get_conversation(self, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """
        Get a specific conversation by ID for the specified user
        """
        from sqlmodel import select

        query = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = self.session.exec(query).first()
        return conversation

    def update_conversation(self, conversation_id: int, conversation_update: ConversationUpdate, user_id: int) -> Optional[Conversation]:
        """
        Update a specific conversation for the specified user
        """
        from sqlmodel import select

        # Get conversation with direct query to avoid recursion
        query = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = self.session.exec(query).first()

        if not conversation:
            return None

        # Update conversation fields based on provided data
        update_data = conversation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(conversation, field, value)

        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)

        return conversation

    def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        """
        Delete a specific conversation for the specified user
        """
        conversation = self.get_conversation(conversation_id, user_id)
        if not conversation:
            return False

        self.session.delete(conversation)
        self.session.commit()

        return True

    def get_conversation_history(self, conversation_id: int, user_id: int, limit: Optional[int] = None) -> List[Message]:
        """
        Get message history for a conversation
        """
        from sqlmodel import select
        from models.message_model import Message

        # First verify the conversation belongs to the user
        from sqlmodel import select
        conv_query = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = self.session.exec(conv_query).first()

        if not conversation:
            return []

        query = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)

        if limit:
            query = query.limit(limit)

        messages = self.session.exec(query).all()
        return messages