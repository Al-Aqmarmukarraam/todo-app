from fastapi import HTTPException, Header, Depends
from typing import Optional
from services.auth_service import auth_service


def get_current_user_id(authorization: str = Header(None)) -> int:
    """Extract user ID from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    user_id = auth_service.verify_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user_id


def get_current_user_id_optional(authorization: str = Header(None)) -> Optional[int]:
    """Extract user ID from Authorization header, returning None if not authenticated"""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    user_id = auth_service.verify_token(token)

    return user_id