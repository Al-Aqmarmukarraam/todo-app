from fastapi import APIRouter, HTTPException, Header
from typing import Dict
from models.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from services.auth_service import auth_service
from models.user import User
from utils.auth import get_current_user_manual

router = APIRouter(tags=["auth"])


class AuthResponse(TokenResponse):
    user: UserResponse


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(register_request: RegisterRequest):
    """Register a new user"""
    try:
        # Attempt to register the user
        user = auth_service.register_user(register_request)

        if not user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create access token for the new user
        access_token = auth_service.create_access_token(user.id)

        # Return both token and user info
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                created_at=user.created_at.isoformat()
            )
        )
    except ValueError as ve:
        # Handle validation errors (duplicate email/username)
        error_detail = str(ve)
        if "Email already registered" in error_detail:
            raise HTTPException(status_code=400, detail="Email already registered")
        elif "Username already taken" in error_detail:
            raise HTTPException(status_code=400, detail="Username already taken")
        else:
            raise HTTPException(status_code=400, detail="Validation error")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in register endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(login_request: LoginRequest):
    """Login with email and password"""
    try:
        user = auth_service.authenticate_user(login_request)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create and return access token with user info
        access_token = auth_service.create_access_token(user.id)
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                created_at=user.created_at.isoformat()
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in login endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_profile(authorization: str = Header(...)):
    """Get the authenticated user's profile"""
    current_user = get_current_user_manual(authorization)
    current_user_id = current_user.id

    # Find the user by ID
    user = auth_service.get_user_by_id(current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user profile information
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        created_at=user.created_at.isoformat()
    )