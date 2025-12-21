"""
Configuration management for the backend application.
Loads settings from environment variables.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_env: str = Field(default="development", alias="APP_ENV")
    port: int = Field(default=8000, alias="PORT")
    
    # Database
    mongodb_uri: str = Field(..., alias="MONGODB_URI")
    
    # JWT Authentication
    jwt_secret: str = Field(..., alias="JWT_SECRET")
    jwt_expire_minutes: int = Field(default=10080, alias="JWT_EXPIRE_MINUTES")
    
    # CORS
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    
    # Google Calendar Integration
    google_client_id: str = Field(..., alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(..., alias="GOOGLE_CLIENT_SECRET")
    google_redirect_uri: str = Field(..., alias="GOOGLE_REDIRECT_URI")
    
    # Encryption
    encryption_key: str = Field(..., alias="ENCRYPTION_KEY")

    # Google Gemini API
    gemini_api_key: str = Field(..., alias="GEMINI_API_KEY")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
_settings = None


def get_settings() -> Settings:
    """
    Get or create the global settings instance.
    
    Returns:
        Settings instance
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings