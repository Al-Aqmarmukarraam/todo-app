from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
import hashlib
from models.user import User, UserCreate
from models.auth import RegisterRequest, LoginRequest
from db.database import get_session
from sqlmodel import select
from contextlib import contextmanager

# Secret key for JWT - in production, this should come from environment variables
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class AuthService:
    def register_user(self, register_request: RegisterRequest) -> Optional[User]:
        """Register a new user"""
        with next(get_session()) as session:
            # Check if email already exists
            existing_user = session.exec(
                select(User).where(User.email == register_request.email)
            ).first()

            if existing_user:
                return None

            # Hash the password
            password_hash = hashlib.sha256(register_request.password.encode()).hexdigest()

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

            return user

    def authenticate_user(self, login_request: LoginRequest) -> Optional[User]:
        """Authenticate a user by email and password"""
        with next(get_session()) as session:
            # Find user by email
            user = session.exec(
                select(User).where(User.email == login_request.email)
            ).first()

            if not user:
                return None

            # Hash the provided password and compare with stored hash
            password_hash = hashlib.sha256(login_request.password.encode()).hexdigest()
            if user.password_hash == password_hash:
                return user
            else:
                return None

    def create_access_token(self, user_id: int) -> str:
        """Create a JWT access token for the user"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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