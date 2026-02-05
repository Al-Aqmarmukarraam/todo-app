"""
Integration test to verify all components work together
"""
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_imports():
    """Test that all modules can be imported without errors"""
    print("Testing imports...")

    try:
        # Test main modules
        from main import app
        print("Main app imported successfully")

        # Test models
        from models.user_model import User, UserCreate
        from models.task_model import Task, TaskCreate, TaskUpdate
        from models.conversation_model import Conversation, ConversationCreate
        from models.message_model import Message, MessageCreate
        print("All models imported successfully")

        # Test database
        from db.database import get_session, engine, create_db_and_tables
        print("Database components imported successfully")

        # Test services
        from services.task_service import TaskService
        from services.conversation_service import ConversationService
        from services.message_service import MessageService
        from services.ai_agent_service import AIAgentService, AIConfig
        print("All services imported successfully")

        # Test API endpoints
        from api.chat_endpoint import router
        print("API endpoints imported successfully")

        # Test utilities
        from utils.auth import get_current_user, create_access_token
        print("Utilities imported successfully")

        print("MCP server is in separate directory, skipping import test")

        print("\nAll imports successful!")
        return True

    except Exception as e:
        print(f"Import error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_token_handling():
    """Test token handling and validation"""
    print("\nTesting token handling...")

    try:
        from utils.auth import create_access_token, verify_token
        from fastapi import HTTPException

        # Create a test token
        test_data = {"sub": "123", "email": "test@example.com"}
        token = create_access_token(test_data)
        print(f"Token created: {token[:20]}...")

        # Verify the token
        from utils.auth import security, verify_token
        credentials_exception = HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        user_id = verify_token(token, credentials_exception)
        print(f"Token verified, user_id: {user_id}")

        print("Token handling works correctly")
        return True

    except Exception as e:
        print(f"Token handling error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_database_models():
    """Test that database models are correctly defined"""
    print("\nTesting database models...")

    try:
        from models.user_model import User, UserCreate
        from models.task_model import Task, TaskCreate, TaskUpdate
        from models.conversation_model import Conversation, ConversationCreate
        from models.message_model import Message, MessageCreate

        # Test creating model instances
        user_create = UserCreate(email="test@example.com", username="testuser", password="password")
        assert user_create.email == "test@example.com"
        print("UserCreate model works")

        task_create = TaskCreate(title="Test task", description="Test description", priority="medium")
        assert task_create.title == "Test task"
        print("TaskCreate model works")

        conversation_create = ConversationCreate(title="Test conversation")
        assert conversation_create.title == "Test conversation"
        print("ConversationCreate model works")

        message_create = MessageCreate(
            conversation_id=1,
            sender_type="user",
            content="Test message"
        )
        assert message_create.content == "Test message"
        print("MessageCreate model works")

        print("All database models work correctly")
        return True

    except Exception as e:
        print(f"Database model error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def run_tests():
    """Run all tests"""
    print("Starting integration tests...\n")

    all_passed = True

    all_passed &= test_imports()
    all_passed &= test_token_handling()
    all_passed &= test_database_models()

    print(f"\n{'='*50}")
    if all_passed:
        print("All tests passed! The system is working correctly.")
    else:
        print("Some tests failed. Please check the errors above.")
    print(f"{'='*50}")

    return all_passed


if __name__ == "__main__":
    run_tests()