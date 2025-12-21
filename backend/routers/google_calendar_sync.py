"""
Google Calendar sync endpoints.
Handles synchronization of symptom logs with Google Calendar.
"""
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from models.user import UserInDB
from services.google_calendar_service import GoogleCalendarService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/google-calendar",
    tags=["Google Calendar Sync"],
    responses={
        400: {"description": "Bad request - Calendar not connected or sync disabled"},
        401: {"description": "Not authenticated"},
        404: {"description": "Resource not found"},
        500: {"description": "Internal server error"}
    }
)


# Request/Response Models
class SyncLogRequest(BaseModel):
    """Request model for syncing a single log."""
    
    log_id: str = Field(..., description="ID of the symptom log to sync")
    
    class Config:
        json_schema_extra = {
            "example": {
                "log_id": "507f1f77bcf86cd799439011"
            }
        }


class SyncResponse(BaseModel):
    """Response model for sync operations."""
    
    success: bool = Field(..., description="Whether the sync was successful")
    message: str = Field(..., description="Status message")
    event_id: Optional[str] = Field(None, description="Google Calendar event ID")
    synced_count: Optional[int] = Field(None, description="Number of logs synced (for batch operations)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Symptom log synced successfully",
                "event_id": "abc123xyz"
            }
        }


class BatchSyncResponse(BaseModel):
    """Response model for batch sync operations."""
    
    success: bool = Field(..., description="Whether the batch sync was successful")
    message: str = Field(..., description="Status message")
    synced_count: int = Field(..., description="Number of logs successfully synced")
    failed_count: int = Field(default=0, description="Number of logs that failed to sync")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Batch sync completed",
                "synced_count": 15,
                "failed_count": 0
            }
        }


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


def verify_calendar_connected(user: UserInDB) -> None:
    """
    Verify that the user has Google Calendar connected.
    
    Args:
        user: User object
        
    Raises:
        HTTPException: If calendar is not connected
    """
    if not user.google_auth or not user.google_auth.encrypted_refresh_token:
        raise HTTPException(
            status_code=400,
            detail="Google Calendar not connected. Please connect your calendar first."
        )
    
    if not user.calendar_settings.is_enabled:
        raise HTTPException(
            status_code=400,
            detail="Calendar sync is disabled. Please enable it in settings."
        )


@router.post(
    "/sync",
    response_model=SyncResponse,
    summary="Sync Single Symptom Log",
    description="Sync a single symptom log to Google Calendar. Creates or updates a calendar event.",
    response_description="Sync operation result with event ID"
)
async def sync_symptom_log(
    request: SyncLogRequest,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Sync a single symptom log to Google Calendar.
    
    This endpoint:
    - Verifies Google Calendar is connected and sync is enabled
    - Retrieves the symptom log from the database
    - Creates a new calendar event or updates existing one
    - Returns the Google Calendar event ID
    
    The event will be created in the user's "Altheia Health" calendar with:
    - Title: "Health Log - [Date]"
    - Description: Symptoms and severity levels
    - All-day event on the log date
    
    Args:
        request: Sync request containing log ID
        background_tasks: FastAPI background tasks
        
    Returns:
        SyncResponse: Sync operation result with event ID
    """
    try:
        # Verify calendar is connected
        verify_calendar_connected(current_user)
        
        # Get the symptom log from database
        # TODO: Implement actual database query
        # log = await db.symptom_logs.find_one({
        #     "_id": ObjectId(request.log_id),
        #     "user_id": current_user.id
        # })
        
        # if not log:
        #     raise HTTPException(status_code=404, detail="Symptom log not found")
        
        # For now, create a mock log for demonstration
        log = {
            "_id": request.log_id,
            "user_id": str(current_user.id),
            "date": "2024-01-15",
            "symptoms": [
                {"name": "Hot Flushes", "severity": 4},
                {"name": "Brain Fog", "severity": 2}
            ],
            "notes": "Feeling stressed today"
        }
        
        # Initialize calendar service
        calendar_service = GoogleCalendarService()
        credentials = calendar_service.get_credentials(
            current_user.google_auth.encrypted_refresh_token
        )
        
        # Check if event already exists
        existing_event_id = calendar_service.get_event_by_log_id(
            credentials,
            current_user.calendar_settings.calendar_id,
            request.log_id
        )
        
        # Sync the log
        event_id = calendar_service.sync_symptom_log(
            credentials,
            current_user.calendar_settings.calendar_id,
            log,
            existing_event_id
        )
        
        # Update last sync time in database
        # TODO: Implement actual database update
        # await db.users.update_one(
        #     {"_id": current_user.id},
        #     {"$set": {"calendar_settings.last_sync": datetime.utcnow()}}
        # )
        
        logger.info(f"Synced log {request.log_id} for user {current_user.id}")
        
        return SyncResponse(
            success=True,
            message="Symptom log synced successfully",
            event_id=event_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to sync log {request.log_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync log: {str(e)}")


@router.post(
    "/sync-all",
    response_model=BatchSyncResponse,
    summary="Batch Sync All Logs",
    description="Sync all symptom logs to Google Calendar. Useful for initial setup or full re-sync.",
    response_description="Batch sync results with counts"
)
async def sync_all_logs(
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Sync all user's symptom logs to Google Calendar.
    
    This endpoint performs a batch sync of all symptom logs:
    - Retrieves all logs from the database
    - Creates or updates calendar events for each log
    - Returns counts of successful and failed syncs
    
    **Use Cases:**
    - Initial setup after connecting Google Calendar
    - Full re-sync after data changes
    - Recovery from sync failures
    
    **Note:** This operation may take time for users with many logs.
    
    Args:
        background_tasks: FastAPI background tasks
        
    Returns:
        BatchSyncResponse: Batch sync operation result with counts
    """
    try:
        # Verify calendar is connected
        verify_calendar_connected(current_user)
        
        # Get all user's symptom logs
        # TODO: Implement actual database query
        # logs = await db.symptom_logs.find({
        #     "user_id": current_user.id
        # }).to_list(length=None)
        
        # For now, create mock logs for demonstration
        logs = [
            {
                "_id": "log1",
                "user_id": str(current_user.id),
                "date": "2024-01-15",
                "symptoms": [{"name": "Hot Flushes", "severity": 4}],
                "notes": "Test log 1"
            },
            {
                "_id": "log2",
                "user_id": str(current_user.id),
                "date": "2024-01-16",
                "symptoms": [{"name": "Brain Fog", "severity": 3}],
                "notes": "Test log 2"
            }
        ]
        
        if not logs:
            return BatchSyncResponse(
                success=True,
                message="No logs to sync",
                synced_count=0,
                failed_count=0
            )
        
        # Initialize calendar service
        calendar_service = GoogleCalendarService()
        credentials = calendar_service.get_credentials(
            current_user.google_auth.encrypted_refresh_token
        )
        
        # Batch sync logs
        event_map = calendar_service.batch_sync_logs(
            credentials,
            current_user.calendar_settings.calendar_id,
            logs
        )
        
        synced_count = len(event_map)
        failed_count = len(logs) - synced_count
        
        # Update last sync time in database
        # TODO: Implement actual database update
        # await db.users.update_one(
        #     {"_id": current_user.id},
        #     {"$set": {"calendar_settings.last_sync": datetime.utcnow()}}
        # )
        
        logger.info(
            f"Batch synced {synced_count} logs for user {current_user.id} "
            f"({failed_count} failed)"
        )
        
        return BatchSyncResponse(
            success=True,
            message=f"Synced {synced_count} of {len(logs)} logs",
            synced_count=synced_count,
            failed_count=failed_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to batch sync logs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync logs: {str(e)}")


@router.delete(
    "/sync/{log_id}",
    response_model=SyncResponse,
    summary="Delete Synced Event",
    description="Remove a calendar event from Google Calendar. The symptom log remains in the app.",
    response_description="Delete operation result"
)
async def delete_synced_log(
    log_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Delete a synced calendar event.
    
    This endpoint:
    - Finds the calendar event associated with the log ID
    - Deletes the event from Google Calendar
    - Keeps the symptom log in the application database
    
    **Important:** This only removes the calendar event, not the symptom log itself.
    
    Args:
        log_id: ID of the symptom log
        
    Returns:
        SyncResponse: Delete operation result with event ID
    """
    try:
        # Verify calendar is connected
        verify_calendar_connected(current_user)
        
        # Initialize calendar service
        calendar_service = GoogleCalendarService()
        credentials = calendar_service.get_credentials(
            current_user.google_auth.encrypted_refresh_token
        )
        
        # Find the event
        event_id = calendar_service.get_event_by_log_id(
            credentials,
            current_user.calendar_settings.calendar_id,
            log_id
        )
        
        if not event_id:
            raise HTTPException(
                status_code=404,
                detail="Calendar event not found for this log"
            )
        
        # Delete the event
        calendar_service.delete_symptom_log(
            credentials,
            current_user.calendar_settings.calendar_id,
            event_id
        )
        
        logger.info(f"Deleted calendar event for log {log_id}")
        
        return SyncResponse(
            success=True,
            message="Calendar event deleted successfully",
            event_id=event_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete calendar event for log {log_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete calendar event: {str(e)}"
        )


@router.post(
    "/toggle-sync",
    summary="Toggle Calendar Sync",
    description="Enable or disable automatic calendar synchronization.",
    response_description="Updated sync status"
)
async def toggle_calendar_sync(
    enabled: bool = Query(..., description="Enable (true) or disable (false) sync"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Enable or disable automatic calendar sync.
    
    This endpoint controls whether new symptom logs are automatically
    synced to Google Calendar. When disabled:
    - New logs won't be synced automatically
    - Existing calendar events remain unchanged
    - Manual sync is still possible
    
    Args:
        enabled: Whether to enable or disable sync
        
    Returns:
        dict: Updated sync status and confirmation message
    """
    try:
        # Verify calendar is connected
        if not current_user.google_auth or not current_user.google_auth.encrypted_refresh_token:
            raise HTTPException(
                status_code=400,
                detail="Google Calendar not connected"
            )
        
        # Update sync setting in database
        # TODO: Implement actual database update
        # await db.users.update_one(
        #     {"_id": current_user.id},
        #     {"$set": {"calendar_settings.is_enabled": enabled}}
        # )
        
        logger.info(f"Calendar sync {'enabled' if enabled else 'disabled'} for user {current_user.id}")
        
        return {
            "success": True,
            "message": f"Calendar sync {'enabled' if enabled else 'disabled'}",
            "sync_enabled": enabled
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle calendar sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))