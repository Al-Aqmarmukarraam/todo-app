from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from models.user import User
from db.database import get_session
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Get secret key from environment variable - ensure consistency with auth_service
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-for-local-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a new access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception):
    """
    Verify the JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    """
    Get the current user from the token (dependency injection version)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = verify_token(credentials.credentials, credentials_exception)
    user = session.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    return user


def get_current_user_manual(authorization_header: str):
    """
    Get the current user from the token (manual header version for todos_router)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extract token from header (assuming format "Bearer <token>")
    if not authorization_header.startswith("Bearer "):
        raise credentials_exception

    token = authorization_header[len("Bearer "):]

    user_id = verify_token(token, credentials_exception)

    # Create a session to get the user
    from db.database import engine
    from sqlmodel import Session
    with Session(engine) as session:
        user = session.get(User, int(user_id))
        if user is None:
            raise credentials_exception
        return user