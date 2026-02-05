from typing import Optional
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
from models.user import User, UserCreate
from models.auth import RegisterRequest, LoginRequest
from db.database import get_session
from sqlmodel import select
from contextlib import contextmanager
import logging
from utils.password_utils import hash_password, verify_password
from dotenv import load_dotenv

# Import related models to resolve relationship issues
from models.task_model import Task
from models.conversation_model import Conversation
from models.message_model import Message

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Secret key for JWT - in production, this should come from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-for-local-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class AuthService:
    def register_user(self, register_request: RegisterRequest) -> Optional[User]:
        """Register a new user"""
        try:
            with next(get_session()) as session:
                # Check if email already exists
                existing_user_by_email = session.exec(
                    select(User).where(User.email == register_request.email)
                ).first()

                if existing_user_by_email:
                    raise ValueError("Email already registered")

                # Check if username already exists
                existing_user_by_username = session.exec(
                    select(User).where(User.username == register_request.username)
                ).first()

                if existing_user_by_username:
                    raise ValueError("Username already taken")

                # Hash the password using bcrypt with proper length handling
                password_hash = hash_password(register_request.password)

                # Create the user
                user = User(
                    email=register_request.email,
                    username=register_request.username,
                    password_hash=password_hash,
                    is_active=True
                )

                # Add to database
                session.add(user)
                session.commit()
                session.refresh(user)

                logger.info(f"Successfully registered user with email: {register_request.email}")
                return user
        except ValueError as ve:
            # Re-raise ValueError which indicates validation issues (duplicate email/username)
            logger.warning(f"Registration validation error: {str(ve)}")
            raise
        except Exception as e:
            # Handle database integrity errors (race conditions, etc.)
            error_str = str(e).lower()
            if "unique constraint failed" in error_str or "duplicate" in error_str:
                if "username" in error_str:
                    raise ValueError("Username already taken")
                elif "email" in error_str or "user.email" in error_str:
                    raise ValueError("Email already registered")
                else:
                    raise ValueError("User data already exists")
            else:
                logger.error(f"Error registering user: {str(e)}")
                raise

    def authenticate_user(self, login_request: LoginRequest) -> Optional[User]:
        """Authenticate a user by email and password"""
        try:
            with next(get_session()) as session:
                # Find user by email
                user = session.exec(
                    select(User).where(User.email == login_request.email)
                ).first()

                if not user:
                    logger.warning(f"Failed login attempt for non-existent email: {login_request.email}")
                    return None

                # Verify the password using bcrypt
                if verify_password(login_request.password, user.password_hash):
                    logger.info(f"Successfully authenticated user: {login_request.email}")
                    return user
                else:
                    logger.warning(f"Failed login attempt for user: {login_request.email} (wrong password)")
                    return None
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            raise

    def create_access_token(self, user_id: int) -> str:
        """Create a JWT access token for the user"""
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": str(user_id),
            "exp": expire.timestamp()
        }
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[int]:
        """Verify a JWT token and return the user ID"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return int(user_id)
        except JWTError:
            return None

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by their ID"""
        with next(get_session()) as session:
            user = session.exec(select(User).where(User.id == user_id)).first()
            return user


# Global instance
auth_service = AuthService()