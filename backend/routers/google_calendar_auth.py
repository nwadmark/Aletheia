"""
Google Calendar OAuth authentication endpoints.
"""
import os
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials

from models.user import UserInDB, GoogleAuthData
from services.google_calendar_service import GoogleCalendarService
from utils.encryption import encrypt_token

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/google-calendar",
    tags=["Google Calendar Authentication"],
    responses={
        401: {"description": "Not authenticated"},
        500: {"description": "Internal server error"}
    }
)


# Dependency to get current user (placeholder - implement based on your auth system)
async def get_current_user() -> UserInDB:
    """
    Get the currently authenticated user.
    This should be replaced with your actual authentication logic.
    """
    # TODO: Implement actual user authentication
    raise HTTPException(status_code=401, detail="Not authenticated")


# Dependency to get database (placeholder - implement based on your DB setup)
async def get_database():
    """
    Get database connection.
    This should be replaced with your actual database logic.
    """
    # TODO: Implement actual database connection
    raise NotImplementedError("Database connection not implemented")


@router.get(
    "/auth",
    summary="Initiate Google OAuth Flow",
    description="Start the OAuth 2.0 flow to connect user's Google Calendar. Returns an authorization URL.",
    response_description="Authorization URL and state parameter for CSRF protection"
)
async def initiate_google_auth(
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Initiate Google OAuth flow.
    
    This endpoint starts the OAuth 2.0 authorization flow for Google Calendar integration.
    The user should be redirected to the returned authorization URL to grant permissions.
    
    **Flow:**
    1. Call this endpoint to get authorization URL
    2. Redirect user to the authorization URL
    3. User grants permissions on Google's consent screen
    4. Google redirects back to the callback endpoint with authorization code
    
    Returns:
        dict: Contains the authorization URL and state parameter
    """
    try:
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        
        if not all([client_id, client_secret, redirect_uri]):
            raise HTTPException(
                status_code=500,
                detail="Google OAuth credentials not configured"
            )
        
        # Create OAuth flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=GoogleCalendarService.SCOPES,
            redirect_uri=redirect_uri
        )
        
        # Generate authorization URL
        authorization_url, state = flow.authorization_url(
            access_type='offline',  # Required for refresh token
            include_granted_scopes='true',
            prompt='consent'  # Force consent to get refresh token
        )
        
        logger.info(f"Generated auth URL for user {current_user.id}")
        
        return {
            "authorization_url": authorization_url,
            "state": state
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate Google auth: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/callback",
    summary="OAuth Callback Handler",
    description="Handle the OAuth callback from Google after user authorization. Exchanges code for tokens.",
    response_description="Redirects to frontend with connection status"
)
async def google_auth_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: Optional[str] = Query(None, description="State parameter for CSRF protection"),
    error: Optional[str] = Query(None, description="Error message if authorization failed"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Handle OAuth callback from Google.
    
    This endpoint is called by Google after the user authorizes the application.
    It exchanges the authorization code for access and refresh tokens, then:
    - Encrypts and stores the refresh token securely
    - Creates an "Altheia Health" calendar in the user's Google Calendar
    - Redirects back to the frontend with connection status
    
    Args:
        code: Authorization code from Google
        state: State parameter for CSRF protection
        error: Error message if authorization failed
        
    Returns:
        RedirectResponse: Redirects to frontend settings page with status
    """
    try:
        # Check for errors
        if error:
            logger.error(f"Google auth error: {error}")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return RedirectResponse(
                url=f"{frontend_url}/settings?calendar_status=error&message={error}"
            )
        
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        
        # Create OAuth flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=GoogleCalendarService.SCOPES,
            redirect_uri=redirect_uri
        )
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        if not credentials.refresh_token:
            raise HTTPException(
                status_code=400,
                detail="No refresh token received. Please revoke access and try again."
            )
        
        # Encrypt and store refresh token
        encrypted_token = encrypt_token(credentials.refresh_token)
        
        # Create or update Google auth data
        google_auth = GoogleAuthData(
            encrypted_refresh_token=encrypted_token,
            token_created_at=datetime.utcnow()
        )
        
        # Create Altheia Health calendar
        calendar_service = GoogleCalendarService()
        calendar_id = calendar_service.create_altheia_calendar(credentials)
        
        # Update user in database
        # TODO: Implement actual database update
        # await db.users.update_one(
        #     {"_id": current_user.id},
        #     {
        #         "$set": {
        #             "google_auth": google_auth.dict(),
        #             "calendar_settings.calendar_id": calendar_id,
        #             "calendar_settings.is_enabled": True,
        #             "updated_at": datetime.utcnow()
        #         }
        #     }
        # )
        
        logger.info(f"Successfully connected Google Calendar for user {current_user.id}")
        
        # Redirect to frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return RedirectResponse(
            url=f"{frontend_url}/settings?calendar_status=connected"
        )
        
    except Exception as e:
        logger.error(f"Failed to handle OAuth callback: {e}")
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return RedirectResponse(
            url=f"{frontend_url}/settings?calendar_status=error&message={str(e)}"
        )


@router.post(
    "/disconnect",
    summary="Disconnect Google Calendar",
    description="Revoke Google Calendar access and clear stored credentials.",
    response_description="Confirmation of disconnection"
)
async def disconnect_google_calendar(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Disconnect Google Calendar integration.
    
    This endpoint:
    - Revokes the OAuth token with Google
    - Clears stored credentials from the database
    - Disables calendar sync
    
    The user will need to re-authorize to reconnect their calendar.
    
    Returns:
        dict: Success message and disconnection status
    """
    try:
        # Check if user has Google Calendar connected
        if not current_user.google_auth or not current_user.google_auth.encrypted_refresh_token:
            raise HTTPException(
                status_code=400,
                detail="Google Calendar not connected"
            )
        
        # Get credentials and revoke access
        try:
            calendar_service = GoogleCalendarService()
            credentials = calendar_service.get_credentials(
                current_user.google_auth.encrypted_refresh_token
            )
            
            # Revoke token
            credentials.revoke(GoogleRequest())
            logger.info(f"Revoked Google Calendar access for user {current_user.id}")
            
        except Exception as e:
            logger.warning(f"Failed to revoke token (may already be revoked): {e}")
        
        # Clear stored credentials in database
        # TODO: Implement actual database update
        # await db.users.update_one(
        #     {"_id": current_user.id},
        #     {
        #         "$set": {
        #             "google_auth": None,
        #             "calendar_settings.is_enabled": False,
        #             "calendar_settings.calendar_id": None,
        #             "calendar_settings.last_sync": None,
        #             "updated_at": datetime.utcnow()
        #         }
        #     }
        # )
        
        logger.info(f"Disconnected Google Calendar for user {current_user.id}")
        
        return {
            "message": "Google Calendar disconnected successfully",
            "status": "disconnected"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disconnect Google Calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/status",
    summary="Get Calendar Connection Status",
    description="Check if user has connected their Google Calendar and get sync settings.",
    response_description="Calendar connection status and sync information"
)
async def get_calendar_status(
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Check if user has Google Calendar connected and get sync status.
    
    Returns information about:
    - Whether Google Calendar is connected
    - If calendar sync is enabled
    - The calendar ID being used
    - Last sync timestamp
    
    Returns:
        dict: Calendar connection and sync status
    """
    try:
        is_connected = (
            current_user.google_auth is not None and
            current_user.google_auth.encrypted_refresh_token is not None
        )
        
        return {
            "connected": is_connected,
            "sync_enabled": current_user.calendar_settings.is_enabled if is_connected else False,
            "calendar_id": current_user.calendar_settings.calendar_id if is_connected else None,
            "last_sync": current_user.calendar_settings.last_sync if is_connected else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get calendar status: {e}")
        raise HTTPException(status_code=500, detail=str(e))