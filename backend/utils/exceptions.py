"""
Custom exceptions for Google Calendar integration.
"""


class GoogleCalendarError(Exception):
    """Base exception for Google Calendar integration errors."""
    pass


class GoogleAuthError(GoogleCalendarError):
    """Raised when Google OAuth authentication fails."""
    pass


class GoogleCalendarSyncError(GoogleCalendarError):
    """Raised when calendar synchronization fails."""
    pass


class TokenDecryptionError(GoogleCalendarError):
    """Raised when token decryption fails."""
    pass


class CalendarNotConnectedError(GoogleCalendarError):
    """Raised when attempting to sync without connected calendar."""
    pass


class InvalidCredentialsError(GoogleCalendarError):
    """Raised when Google credentials are invalid or expired."""
    pass