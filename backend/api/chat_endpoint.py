from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional
from models.user import User
from models.conversation_model import Conversation
from models.message_model import Message, MessageCreate
from utils.auth import get_current_user
from services.conversation_service import ConversationService
from services.message_service import MessageService
from services.ai_agent_service import AIAgentService, AIConfig
from db.database import get_session
from pydantic import BaseModel
import uuid
import os


router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    metadata: dict


import logging
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Main chat endpoint for AI interactions
    """
    logger.info(f"Received chat request for user {current_user.id}")
    logger.info(f"Request data: {request}")

    conversation_service = ConversationService(session)
    message_service = MessageService(session)

    # Get or create conversation
    if request.conversation_id:
        conversation = conversation_service.get_conversation(request.conversation_id, current_user.id)
        if not conversation:
            # If conversation doesn't exist, create a new one instead of throwing error
            from models.conversation_model import ConversationCreate
            conversation_create_data = ConversationCreate()
            conversation = conversation_service.create_conversation(
                conversation_data=conversation_create_data,
                user_id=current_user.id
            )
        # If conversation exists and belongs to user, use it
    else:
        # Create new conversation
        from models.conversation_model import ConversationCreate
        conversation_create_data = ConversationCreate()
        conversation = conversation_service.create_conversation(
            conversation_data=conversation_create_data,
            user_id=current_user.id
        )

    # Create user message
    user_message = MessageCreate(
        user_id=current_user.id,
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    message_service.create_message(user_message)

    # Initialize AI agent service
    config = AIConfig(
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        mcp_server_url=os.getenv("MCP_SERVER_URL", "http://localhost:8001")
    )
    ai_agent = AIAgentService(config)
    await ai_agent.initialize_openai()

    # Process the message with the AI agent
    ai_response = await ai_agent.process_message(
        message_content=request.message,
        user_id=current_user.id,
        conversation_id=conversation.id,
        session=session
    )

    # Create AI response message
    ai_message = MessageCreate(
        user_id=current_user.id,
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response
    )
    message_service.create_message(ai_message)

    # Close the AI agent resources
    await ai_agent.close()

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation.id,
        metadata={"user_id": current_user.id}
    )


@router.get("/conversations")
async def get_user_conversations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all conversations for the current user
    """
    conversation_service = ConversationService(session)
    conversations = conversation_service.get_conversations(current_user.id)
    return conversations


@router.get("/conversations/{conversation_id}")
async def get_conversation_history(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get conversation history for a specific conversation
    """
    conversation_service = ConversationService(session)
    messages = conversation_service.get_conversation_history(conversation_id, current_user.id)
    return messages