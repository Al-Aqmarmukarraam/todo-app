from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.chat_endpoint import router as chat_router
from api.auth_router import router as auth_router
from db.database import create_db_and_tables
from utils.auth import get_current_user
from models.user import User

# Create FastAPI app
app = FastAPI(
    title="Todo AI Chatbot API",
    description="AI-powered Todo Chatbot with MCP agent integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(auth_router, prefix="/api")

@app.on_event("startup")
def on_startup():
    """
    Create database tables on startup
    """
    create_db_and_tables()

@app.get("/")
def read_root():
    """
    Root endpoint for health check
    """
    return {"message": "Todo AI Chatbot API is running"}

@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "Todo AI Chatbot API"}

@app.get("/api/test-auth")
def test_auth(current_user: User = Depends(get_current_user)):
    """
    Test endpoint to verify authentication
    """
    if current_user:
        return {"authenticated": True, "user_id": current_user.id, "email": current_user.email}
    else:
        return {"authenticated": False}