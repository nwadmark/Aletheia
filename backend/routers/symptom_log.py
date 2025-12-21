"""
Router for daily symptom logging operations.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from pymongo import ReturnDocument

from database import get_database
from models.user import UserInDB
from models.symptom_log import SymptomLogCreate, SymptomLogResponse, SymptomLogInDB
from utils.security import get_current_user

router = APIRouter(
    prefix="/api/logs",
    tags=["Symptom Logs"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=SymptomLogResponse)
async def upsert_symptom_log(
    log_in: SymptomLogCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Create or update a symptom log for a specific date.
    If a log exists for the given date, it will be updated.
    """
    user_id = ObjectId(current_user.id)
    current_time = datetime.utcnow()
    
    # Use find_one_and_update with upsert=True to atomically create or update
    updated_doc = await db.symptom_logs.find_one_and_update(
        {
            "user_id": user_id,
            "date": log_in.date
        },
        {
            "$set": {
                "symptoms": [s.dict() for s in log_in.symptoms],
                "overall_notes": log_in.overall_notes,
                "updated_at": current_time
            },
            "$setOnInsert": {
                "created_at": current_time
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    
    updated_doc["id"] = str(updated_doc["_id"])
    updated_doc["user_id"] = str(updated_doc["user_id"])
    return SymptomLogResponse(**updated_doc)

@router.get("/", response_model=List[SymptomLogResponse])
async def get_symptom_logs(
    start_date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Retrieve symptom logs for the current user.
    Optionally filter by start_date and end_date (inclusive).
    """
    query = {"user_id": ObjectId(current_user.id)}
    
    # Add date range filter if provided
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date
        if end_date:
            date_query["$lte"] = end_date
        query["date"] = date_query
        
    cursor = db.symptom_logs.find(query).sort("date", -1) # Sort by date descending
    
    # If no range specified, limit to last 30 entries by default to prevent over-fetching
    if not (start_date or end_date):
        cursor = cursor.limit(30)
        
    logs = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        logs.append(SymptomLogResponse(**doc))
        
    return logs

@router.delete("/{date}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom_log(
    date: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Delete a symptom log for a specific date.
    """
    result = await db.symptom_logs.delete_one({
        "user_id": ObjectId(current_user.id),
        "date": date
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No symptom log found for date {date}"
        )