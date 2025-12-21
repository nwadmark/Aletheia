"""
Authentication router implementing Signup, Login, and User Profile endpoints.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from database import get_database
from models.user import UserCreate, UserInDB, UserResponse, UserUpdate
from utils.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user
)
from config import get_settings

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

settings = get_settings()

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db = Depends(get_database)):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    
    # Create user document
    user_doc = UserInDB(
        **user_in.dict(),
        password_hash=hashed_password
    )
    
    # Insert into database
    new_user = await db.users.insert_one(user_doc.dict(by_alias=True, exclude={"id"}))
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    # Create access token for auto-login
    access_token_expires = timedelta(minutes=settings.jwt_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(created_user["_id"])},
        expires_delta=access_token_expires
    )
    
    # Map for response
    created_user["id"] = str(created_user["_id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**created_user)
    }

@router.post("/login", response_model=dict)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_database)
):
    """
    Authenticate user and return JWT token.
    """
    # Find user by email
    user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.jwt_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """
    Get current authenticated user profile.
    """
    # Convert UserInDB to UserResponse
    # UserResponse handles the exclusion of sensitive fields and flattening
    # We just need to make sure the input dict maps correctly
    user_dict = current_user.dict(by_alias=True)
    
    # Ensure id is string (UserResponse expects 'id', UserInDB has '_id')
    if "_id" in user_dict:
        user_dict["id"] = str(user_dict["_id"])
        
    # UserResponse will compute calendar_connected and other fields if we use the constructor
    # logic from UserResponse? No, UserResponse is a Pydantic model.
    # We need to manually populate the computed fields if they aren't in the DB model.
    # Wait, UserResponse fields: calendar_connected, calendar_sync_enabled, last_calendar_sync.
    # These are NOT in UserInDB directly. UserInDB has calendar_settings and google_auth.
    
    calendar_connected = (
        current_user.google_auth is not None and
        current_user.google_auth.encrypted_refresh_token is not None
    )
    
    user_dict.update({
        "calendar_connected": calendar_connected,
        "calendar_sync_enabled": current_user.calendar_settings.is_enabled if calendar_connected else False,
        "last_calendar_sync": current_user.calendar_settings.last_sync if calendar_connected else None
    })
    
    return UserResponse(**user_dict)

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update current user profile.
    """
    user_id = current_user.id
    
    # Filter out None values from update data
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
        
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user in database
    await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": user_id})
    
    # Prepare response (similar logic to read_users_me)
    user_dict = updated_user
    user_dict["id"] = str(user_dict["_id"])
    
    # Add computed fields (same logic as read_users_me)
    # We need to reconstruct the UserInDB to access properties or just manually check dict
    # Since we have the dict, let's just check the dict structure which matches the DB
    
    # Helper to check calendar connection from dict
    google_auth = user_dict.get("google_auth")
    calendar_connected = (
        google_auth is not None and
        google_auth.get("encrypted_refresh_token") is not None
    )
    
    calendar_settings = user_dict.get("calendar_settings", {})
    
    user_dict.update({
        "calendar_connected": calendar_connected,
        "calendar_sync_enabled": calendar_settings.get("is_enabled", False) if calendar_connected else False,
        "last_calendar_sync": calendar_settings.get("last_sync") if calendar_connected else None
    })
    
    return UserResponse(**user_dict)