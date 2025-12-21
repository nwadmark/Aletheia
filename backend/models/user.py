"""
User model with Google Calendar integration support.
"""
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic_core import core_schema
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_before_validator_function(cls.validate, core_schema.str_schema()),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, _handler: GetJsonSchemaHandler
    ) -> Dict[str, Any]:
        return {"type": "string"}


class GoogleCalendarSettings(BaseModel):
    """Google Calendar integration settings."""
    
    is_enabled: bool = Field(default=False, description="Whether Google Calendar sync is enabled")
    calendar_id: Optional[str] = Field(default=None, description="ID of the Altheia Health calendar")
    last_sync: Optional[datetime] = Field(default=None, description="Timestamp of last successful sync")
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_enabled": True,
                "calendar_id": "altheia_health_123@group.calendar.google.com",
                "last_sync": "2024-01-15T10:30:00Z"
            }
        }


class GoogleAuthData(BaseModel):
    """Encrypted Google OAuth credentials."""
    
    encrypted_refresh_token: Optional[str] = Field(
        default=None, 
        description="Encrypted Google OAuth refresh token"
    )
    token_created_at: Optional[datetime] = Field(
        default=None,
        description="When the token was first created"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "encrypted_refresh_token": "gAAAAABf...",
                "token_created_at": "2024-01-15T10:30:00Z"
            }
        }


class UserBase(BaseModel):
    """Base user model with common fields."""
    
    email: EmailStr = Field(..., description="User's email address")
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    age_range: Optional[str] = Field(default=None, description="User's age range")
    menstrual_status: Optional[str] = Field(default=None, description="User's menstrual status")
    primary_symptoms: list[str] = Field(default_factory=list, description="User's primary symptoms")
    onboarding_completed: bool = Field(default=False, description="Whether onboarding is complete")


class UserCreate(UserBase):
    """Model for creating a new user."""
    
    password: str = Field(..., min_length=8, description="User's password")


class UserInDB(UserBase):
    """User model as stored in database."""
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str = Field(..., description="Hashed password")
    google_auth: Optional[GoogleAuthData] = Field(
        default=None,
        description="Encrypted Google OAuth credentials"
    )
    calendar_settings: GoogleCalendarSettings = Field(
        default_factory=GoogleCalendarSettings,
        description="Google Calendar integration settings"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Account creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "name": "Jane Doe",
                "age_range": "45-54",
                "menstrual_status": "perimenopause",
                "primary_symptoms": ["hot_flushes", "brain_fog"],
                "onboarding_completed": True,
                "google_auth": {
                    "encrypted_refresh_token": "gAAAAABf...",
                    "token_created_at": "2024-01-15T10:30:00Z"
                },
                "calendar_settings": {
                    "is_enabled": True,
                    "calendar_id": "altheia_health_123@group.calendar.google.com",
                    "last_sync": "2024-01-15T10:30:00Z"
                },
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class UserResponse(UserBase):
    """User model for API responses (excludes sensitive data)."""
    
    id: str = Field(..., description="User ID")
    calendar_connected: bool = Field(default=False, description="Whether Google Calendar is connected")
    calendar_sync_enabled: bool = Field(default=False, description="Whether calendar sync is enabled")
    last_calendar_sync: Optional[datetime] = Field(default=None, description="Last sync timestamp")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "name": "Jane Doe",
                "age_range": "45-54",
                "menstrual_status": "perimenopause",
                "primary_symptoms": ["hot_flushes", "brain_fog"],
                "onboarding_completed": True,
                "calendar_connected": True,
                "calendar_sync_enabled": True,
                "last_calendar_sync": "2024-01-15T10:30:00Z",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class UserUpdate(BaseModel):
    """Model for updating user profile."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    age_range: Optional[str] = None
    menstrual_status: Optional[str] = None
    primary_symptoms: Optional[list[str]] = None
    onboarding_completed: Optional[bool] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "age_range": "45-54",
                "menstrual_status": "perimenopause",
                "primary_symptoms": ["hot_flushes", "brain_fog", "sleep_issues"],
                "onboarding_completed": True
            }
        }