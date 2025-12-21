"""
Symptom Log models for daily tracking.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from models.user import PyObjectId

class SymptomItem(BaseModel):
    """Individual symptom entry with severity."""
    name: str = Field(..., description="Name of the symptom")
    severity: int = Field(..., ge=1, le=5, description="Severity rating (1-5)")
    notes: Optional[str] = Field(None, description="Optional notes for this specific symptom")

class SymptomLogBase(BaseModel):
    """Base model for daily symptom log."""
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Date in YYYY-MM-DD format")
    symptoms: List[SymptomItem] = Field(default_factory=list, description="List of symptoms logged for the day")
    overall_notes: Optional[str] = Field(None, description="General notes for the day")

class SymptomLogCreate(SymptomLogBase):
    """Model for creating/updating a log."""
    pass

class SymptomLogInDB(SymptomLogBase):
    """Symptom log as stored in the database."""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="User ID who owns this log")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SymptomLogResponse(SymptomLogBase):
    """API response model for symptom log."""
    id: str = Field(..., description="Log ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}