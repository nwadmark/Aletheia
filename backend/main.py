"""
Main FastAPI application for Altheia backend with Google Calendar integration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from config import get_settings
from routers import google_calendar_auth, google_calendar_sync, auth, symptom_log, articles, chat
from database import connect_to_mongo, close_mongo_connection

# Load environment variables from .env file
load_dotenv()

# Get settings
settings = get_settings()

# Create FastAPI app with enhanced Swagger documentation
app = FastAPI(
    title="Altheia Backend API",
    description="""
    ## Altheia Health Tracking Backend API
    
    This API provides endpoints for the Altheia health tracking application with Google Calendar integration.
    
    ### Features
    
    * **Google Calendar Authentication**: OAuth 2.0 flow for connecting user's Google Calendar
    * **Symptom Log Syncing**: Sync health symptom logs to Google Calendar events
    * **Batch Operations**: Sync multiple logs at once
    * **Secure Token Storage**: Encrypted storage of OAuth tokens
    
    ### Authentication Flow
    
    1. Initiate OAuth flow with `/api/google-calendar/auth/initiate`
    2. User authorizes on Google's consent screen
    3. Handle callback at `/api/google-calendar/auth/callback`
    4. Tokens are securely stored and encrypted
    
    ### API Endpoints
    
    All Google Calendar endpoints are prefixed with `/api/google-calendar`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Altheia Support",
        "email": "support@altheia.com",
    },
    license_info={
        "name": "MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.altheia.com",
            "description": "Production server"
        }
    ]
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(symptom_log.router)
app.include_router(articles.router)
app.include_router(google_calendar_auth.router)
app.include_router(google_calendar_sync.router)
app.include_router(chat.router)

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "status": "healthy",
        "message": "Altheia Backend API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.app_env
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True if settings.app_env == "development" else False,
        reload_dirs=["backend"],
        use_colors=True
    )